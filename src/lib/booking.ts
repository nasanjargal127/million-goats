import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { userIdsFromEnv } from "./admin";
import { prisma } from "./db";
import { sendDepositEmail } from "./installment-emails";
import {
  installmentsOpen,
  type LabChoice,
  labChoiceLabel,
  labChoicePrice,
  PREMIUM_INSTALLMENTS,
} from "./lab/packages";
import { cancelInvoice, checkInvoicePayment, createInvoice, qpayConfigured } from "./qpay";
import { site } from "./site";

/** How long selected seats stay reserved (and invoices stay open) while the visitor pays. */
export const HOLD_MINUTES = 15;
const MAX_SEATS_PER_ORDER = 6;
/** What test accounts pay instead of the real price (see QPAY_TEST_USER_IDS). */
const TEST_CHARGE_MNT = 100;
/** Don't ask QPay about the same order more often than this. */
const CHECK_INTERVAL_MS = 4_000;

const seatLabel = (row: string, number: number) => `${row}-${number}`;

function parseLabel(label: string) {
  const [row, num] = label.split("-");
  return { row, number: Number(num) };
}

export class BookingError extends Error {
  constructor(
    readonly code: "INVALID" | "TAKEN" | "PAYMENT_UNAVAILABLE",
    message: string,
  ) {
    super(message);
    this.name = "BookingError";
  }
}

// ─── Reading ────────────────────────────────────────────────────────────────

type SeatView = { id: string; row: string; number: number; taken: boolean };

/** Event with its seat map; seats whose hold has lapsed count as free. */
export async function getEventWithSeats(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { seats: { orderBy: [{ row: "asc" }, { number: "asc" }] } },
  });
  if (!event?.published) return null;
  const now = new Date();
  const seats: SeatView[] = event.seats.map((s) => ({
    id: s.id,
    row: s.row,
    number: s.number,
    taken:
      s.status === "SOLD" || (s.status === "HELD" && s.heldUntil !== null && s.heldUntil > now),
  }));
  return { ...event, seats };
}

export function getOrderForUser(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { event: true, variant: { include: { product: true } } },
  });
}

// ─── Reserving ──────────────────────────────────────────────────────────────

function callbackUrl(orderId: string) {
  const url = new URL("/api/qpay/callback", site.url);
  url.searchParams.set("order", orderId);
  url.searchParams.set("sig", signOrderId(orderId));
  return url.toString();
}

function signOrderId(orderId: string) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");
  return createHmac("sha256", secret).update(`qpay:${orderId}`).digest("hex");
}

export function verifyOrderSignature(orderId: string, sig: string) {
  const expected = Buffer.from(signOrderId(orderId));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/**
 * Holds the seats for HOLD_MINUTES and creates a QPay invoice for them.
 * Seat holds are taken with a conditional update inside a transaction, so two
 * people can never hold the same seat. With a Trading Lab package, each seat is
 * priced by the package instead of the event.
 */
export async function reserveSeats(input: {
  userId: string;
  eventId: string;
  seatIds: string[];
  lab?: LabChoice;
}) {
  const seatIds = [...new Set(input.seatIds)];
  if (seatIds.length === 0 || seatIds.length > MAX_SEATS_PER_ORDER) {
    throw new BookingError("INVALID", `1–${MAX_SEATS_PER_ORDER} суудал сонгоно уу.`);
  }
  assertPaymentAvailable();

  const event = await prisma.event.findUnique({ where: { id: input.eventId } });
  if (!event?.published) throw new BookingError("INVALID", "Эвент олдсонгүй.");
  if (input.lab?.installments && !installmentsOpen()) {
    throw new BookingError(
      "INVALID",
      "Хувааж төлөх хугацаа дууссан. Нэг дор төлөх сонголтыг сонгоно уу.",
    );
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60_000);
  const seatPrice = input.lab ? labChoicePrice(input.lab) : event.priceMnt;
  const itemLabel = input.lab ? labChoiceLabel(input.lab) : null;
  // Installments: the first invoice is only for the first part of each seat.
  const depositMnt = input.lab?.installments
    ? PREMIUM_INSTALLMENTS.firstMnt * seatIds.length
    : null;

  const order = await prisma.$transaction(async (tx) => {
    const seats = await tx.seat.findMany({
      where: { id: { in: seatIds }, eventId: event.id },
      orderBy: [{ row: "asc" }, { number: "asc" }],
    });
    if (seats.length !== seatIds.length) throw new BookingError("INVALID", "Суудал олдсонгүй.");

    const created = await tx.order.create({
      data: {
        userId: input.userId,
        eventId: event.id,
        amountMnt: seatPrice * seats.length,
        seatLabels: seats.map((s) => seatLabel(s.row, s.number)),
        itemLabel,
        ...(input.lab && {
          labPackage: input.lab.labPackage,
          teacher: input.lab.teacher,
          withPsychologist: input.lab.withPsychologist,
        }),
        ...(depositMnt !== null && {
          depositMnt,
          balanceDueAt: PREMIUM_INSTALLMENTS.balanceDueAt,
        }),
        expiresAt,
      },
    });

    const held = await tx.seat.updateMany({
      where: {
        id: { in: seatIds },
        OR: [{ status: "AVAILABLE" }, { status: "HELD", heldUntil: { lt: now } }],
      },
      data: { status: "HELD", heldUntil: expiresAt, orderId: created.id },
    });
    if (held.count !== seatIds.length) {
      throw new BookingError("TAKEN", "Сонгосон суудлын зарим нь саяхан захиалагдсан байна.");
    }
    return created;
  });

  await attachInvoice({
    orderId: order.id,
    userId: input.userId,
    description: [
      `${event.title}: ${order.seatLabels.join(", ")}`,
      itemLabel,
      depositMnt !== null ? "1-р төлөлт" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    amount: depositMnt ?? order.amountMnt,
  });
  return order.id;
}

export function assertPaymentAvailable() {
  if (!qpayConfigured) {
    throw new BookingError(
      "PAYMENT_UNAVAILABLE",
      "Төлбөрийн систем одоогоор тохируулагдаагүй байна.",
    );
  }
}

/**
 * Creates the QPay invoice for a freshly created PENDING order and stores it.
 * If QPay fails, the order is cancelled (releasing any seats it holds).
 * Test accounts (QPAY_TEST_USER_IDS) keep the real price on the order but are
 * invoiced TEST_CHARGE_MNT, so payments can be tested in production.
 */
export async function attachInvoice(input: {
  orderId: string;
  userId: string;
  description: string;
  amount: number;
}) {
  try {
    const data = await issueInvoice({ ...input, invoiceNo: input.orderId });
    await prisma.order.update({ where: { id: input.orderId }, data });
  } catch (error) {
    await releaseOrder(input.orderId, "CANCELLED");
    console.error("QPay invoice creation failed", error);
    throw new BookingError("PAYMENT_UNAVAILABLE", "Нэхэмжлэх үүсгэж чадсангүй. Дахин оролдоно уу.");
  }
}

/** Asks QPay for an invoice and returns the order fields that store it. */
async function issueInvoice(input: {
  orderId: string;
  /** QPay's sender_invoice_no: the order id, plus a suffix for a balance invoice. */
  invoiceNo: string;
  userId: string;
  description: string;
  amount: number;
}) {
  const test = userIdsFromEnv("QPAY_TEST_USER_IDS").has(input.userId);
  const charged = test ? Math.min(TEST_CHARGE_MNT, input.amount) : input.amount;
  const invoice = await createInvoice({
    senderInvoiceNo: input.invoiceNo,
    receiverCode: input.userId,
    description: `${test ? "[TEST] " : ""}${input.description}`.slice(0, 255),
    amount: charged,
    callbackUrl: callbackUrl(input.orderId),
  });
  return {
    chargedMnt: charged,
    qpayInvoiceId: invoice.invoiceId,
    qpayQrText: invoice.qrText,
    qpayQrImage: invoice.qrImage,
    qpayShortUrl: invoice.shortUrl,
    qpayUrls: invoice.urls as Prisma.InputJsonValue,
  };
}

/**
 * Creates the QPay invoice for the balance of an installment order whose first
 * part is paid. Does nothing if that invoice already exists.
 */
export async function startBalancePayment(orderId: string, userId: string) {
  assertPaymentAvailable();
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { event: true },
  });
  if (order?.status !== "DEPOSIT_PAID" || order.depositMnt === null) {
    throw new BookingError("INVALID", "Үлдэгдэл төлөх захиалга олдсонгүй.");
  }
  if (order.qpayInvoiceId) return;
  if (order.balanceDueAt && order.balanceDueAt.getTime() < Date.now()) {
    await syncOrder(order.id);
    throw new BookingError("INVALID", "Үлдэгдэл төлөх хугацаа дууссан.");
  }

  let data: Awaited<ReturnType<typeof issueInvoice>>;
  try {
    data = await issueInvoice({
      orderId: order.id,
      invoiceNo: `${order.id}-2`,
      userId,
      description: [
        `${order.event?.title}: ${order.seatLabels.join(", ")}`,
        order.itemLabel,
        "Үлдэгдэл",
      ]
        .filter(Boolean)
        .join(" · "),
      amount: order.amountMnt - order.depositMnt,
    });
  } catch (error) {
    console.error("QPay balance invoice creation failed", error);
    throw new BookingError("PAYMENT_UNAVAILABLE", "Нэхэмжлэх үүсгэж чадсангүй. Дахин оролдоно уу.");
  }
  // Two clicks at once: keep the first invoice and drop this one.
  const saved = await prisma.order.updateMany({
    where: { id: order.id, status: "DEPOSIT_PAID", qpayInvoiceId: null },
    data,
  });
  if (saved.count === 0) await cancelInvoice(data.qpayInvoiceId);
}

// ─── Payment status ─────────────────────────────────────────────────────────

/** Ends a PENDING order and gives back any seats it was holding. */
async function releaseOrder(orderId: string, status: "EXPIRED" | "CANCELLED") {
  await prisma.$transaction(async (tx) => {
    const ended = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status },
    });
    if (ended.count === 0) return; // already released, paid or cancelled
    await tx.seat.updateMany({
      where: { orderId, status: "HELD" },
      data: { status: "AVAILABLE", heldUntil: null, orderId: null },
    });
  });
}

/**
 * The first part of an installment order is paid: hold its seats until the
 * balance is due, and move the paid invoice aside so the balance can get its
 * own. If the seats went to someone else meanwhile, flag it for a refund.
 */
async function confirmDepositPaid(
  order: {
    id: string;
    eventId: string | null;
    seatLabels: string[];
    balanceDueAt: Date | null;
    qpayInvoiceId: string | null;
    chargedMnt: number | null;
  },
  paymentId: string | null,
) {
  const eventId = order.eventId;
  const due = order.balanceDueAt;
  if (!eventId || !due) throw new Error(`Installment order ${order.id} has no event or due date`);
  const now = new Date();
  try {
    await prisma.$transaction(async (tx) => {
      const held = await tx.seat.updateMany({
        where: {
          eventId,
          OR: order.seatLabels.map(parseLabel),
          AND: {
            OR: [
              { orderId: order.id, status: "HELD" },
              { status: "AVAILABLE" },
              { status: "HELD", heldUntil: { lt: now } },
            ],
          },
        },
        data: { status: "HELD", heldUntil: due, orderId: order.id },
      });
      if (held.count !== order.seatLabels.length) throw new Error("SEATS_LOST");
      await tx.order.updateMany({
        where: { id: order.id, depositPaidAt: null },
        data: {
          status: "DEPOSIT_PAID",
          expiresAt: due,
          depositPaidAt: now,
          depositPaymentId: paymentId,
          depositInvoiceId: order.qpayInvoiceId,
          depositChargedMnt: order.chargedMnt,
          chargedMnt: null,
          qpayInvoiceId: null,
          qpayQrText: null,
          qpayQrImage: null,
          qpayShortUrl: null,
          qpayUrls: Prisma.DbNull,
          checkedAt: null,
        },
      });
    });
  } catch (error) {
    if (!(error instanceof Error && error.message === "SEATS_LOST")) throw error;
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "REFUND_REQUIRED", paidAt: now, qpayPaymentId: paymentId },
    });
  }
}

/** The balance was not paid in time: release the seats and keep the first part. */
async function markBalanceUnpaid(orderId: string) {
  await prisma.$transaction(async (tx) => {
    const ended = await tx.order.updateMany({
      where: { id: orderId, status: "DEPOSIT_PAID" },
      data: { status: "BALANCE_UNPAID" },
    });
    if (ended.count === 0) return;
    await tx.seat.updateMany({
      where: { orderId, status: "HELD" },
      data: { status: "AVAILABLE", heldUntil: null, orderId: null },
    });
  });
}

/** Merch has no stock to hold: a confirmed payment simply marks the order paid. */
async function confirmMerchPaid(order: { id: string }, paymentId: string | null) {
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID", paidAt: new Date(), qpayPaymentId: paymentId },
  });
}

/** Marks the order paid and its seats sold — or flags it for a refund if the seats are gone. */
async function confirmPaid(
  order: {
    id: string;
    kind: string;
    status: string;
    eventId: string | null;
    seatLabels: string[];
  },
  paymentId: string | null,
) {
  if (order.kind === "MERCH") return confirmMerchPaid(order, paymentId);
  const eventId = order.eventId;
  if (!eventId) throw new Error(`Seat order ${order.id} has no event`);
  const now = new Date();
  try {
    await prisma.$transaction(async (tx) => {
      const sold = await tx.seat.updateMany({
        where: {
          eventId,
          OR: order.seatLabels.map(parseLabel),
          AND: {
            OR: [
              { orderId: order.id, status: "HELD" },
              { status: "AVAILABLE" },
              { status: "HELD", heldUntil: { lt: now } },
            ],
          },
        },
        data: { status: "SOLD", heldUntil: null, orderId: order.id },
      });
      if (sold.count !== order.seatLabels.length) throw new Error("SEATS_LOST");
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: now, qpayPaymentId: paymentId },
      });
    });
  } catch (error) {
    if (!(error instanceof Error && error.message === "SEATS_LOST")) throw error;
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "REFUND_REQUIRED", paidAt: now, qpayPaymentId: paymentId },
    });
  }
}

/**
 * Brings an order up to date: confirms it if QPay reports payment, or expires it
 * once the hold (or, for installments, the balance deadline) runs out. Safe to
 * call from the status poller, the QPay callback and the daily cron.
 */
export async function syncOrder(orderId: string, { force = false } = {}) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return order;
  const now = Date.now();
  const balanceOverdue =
    order.status === "DEPOSIT_PAID" &&
    order.balanceDueAt !== null &&
    order.balanceDueAt.getTime() < now;

  if (!order.qpayInvoiceId) {
    // First part paid, balance invoice not asked for yet.
    if (!balanceOverdue) return order;
    await markBalanceUnpaid(order.id);
    return prisma.order.findUnique({ where: { id: order.id } });
  }
  const open = order.status === "PENDING" || order.status === "DEPOSIT_PAID";
  // Ended orders are only re-checked when QPay calls back (a late payment).
  const late = force && (order.status === "EXPIRED" || order.status === "BALANCE_UNPAID");
  if (!open && !late) return order;

  if (!force && order.checkedAt && now - order.checkedAt.getTime() < CHECK_INTERVAL_MS) {
    return order;
  }
  await prisma.order.update({ where: { id: order.id }, data: { checkedAt: new Date(now) } });

  const payment = await checkInvoicePayment(order.qpayInvoiceId);
  if (payment.paid && payment.paidAmount >= (order.chargedMnt ?? order.amountMnt)) {
    if (order.depositMnt !== null && order.depositPaidAt === null) {
      await confirmDepositPaid(order, payment.paymentId);
      await sendDepositEmail(order.id);
    } else {
      await confirmPaid(order, payment.paymentId);
    }
  } else if (order.status === "PENDING" && order.expiresAt.getTime() < now) {
    await cancelInvoice(order.qpayInvoiceId);
    await releaseOrder(order.id, "EXPIRED");
  } else if (balanceOverdue) {
    await cancelInvoice(order.qpayInvoiceId);
    await markBalanceUnpaid(order.id);
  }
  return prisma.order.findUnique({ where: { id: order.id } });
}

// ─── Cleanup ────────────────────────────────────────────────────────────────

/**
 * Unpaid orders are kept this long after their hold ends, then deleted. The
 * purge re-checks QPay first, so this only has to cover a payment in flight.
 */
const PURGE_AFTER_MS = 60 * 60_000;
const PURGE_BATCH = 200;

/**
 * Deletes unpaid orders whose hold ended more than PURGE_AFTER_MS ago. Each one
 * is checked with QPay first (which also cancels its invoice and frees its
 * seats), so a late payment turns it PAID or REFUND_REQUIRED and keeps it.
 * Orders QPay cannot be asked about right now are left for the next run.
 */
export async function purgeExpiredOrders() {
  const cutoff = new Date(Date.now() - PURGE_AFTER_MS);
  const stale = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "EXPIRED"] }, expiresAt: { lt: cutoff } },
    select: { id: true, qpayInvoiceId: true },
    orderBy: { expiresAt: "asc" },
    take: PURGE_BATCH,
  });

  let deleted = 0;
  let kept = 0;
  for (const order of stale) {
    try {
      if (order.qpayInvoiceId) {
        await syncOrder(order.id, { force: true });
      } else {
        await releaseOrder(order.id, "EXPIRED"); // never got an invoice, so nothing to pay
      }
      const removed = await prisma.order.deleteMany({ where: { id: order.id, status: "EXPIRED" } });
      if (removed.count > 0) deleted += 1;
      else kept += 1;
    } catch (error) {
      console.error(`Could not purge order ${order.id}`, error);
      kept += 1;
    }
  }
  return { checked: stale.length, deleted, kept };
}

/**
 * Installment orders whose balance deadline has passed: a last check with QPay,
 * then their seats are released (BALANCE_UNPAID). These orders are kept.
 */
export async function expireOverdueBalances() {
  const overdue = await prisma.order.findMany({
    where: { status: "DEPOSIT_PAID", balanceDueAt: { lt: new Date() } },
    select: { id: true },
    take: PURGE_BATCH,
  });
  let failed = 0;
  for (const order of overdue) {
    try {
      await syncOrder(order.id, { force: true });
    } catch (error) {
      console.error(`Could not expire balance of order ${order.id}`, error);
      failed += 1;
    }
  }
  return { checked: overdue.length, failed };
}
