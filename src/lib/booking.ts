import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "./db";
import { type LabChoice, labChoiceLabel, labChoicePrice } from "./lab/packages";
import { cancelInvoice, checkInvoicePayment, createInvoice, qpayConfigured } from "./qpay";
import { site } from "./site";

/** How long selected seats stay reserved (and invoices stay open) while the visitor pays. */
export const HOLD_MINUTES = 15;
const MAX_SEATS_PER_ORDER = 6;
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

  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60_000);
  const seatPrice = input.lab ? labChoicePrice(input.lab) : event.priceMnt;
  const itemLabel = input.lab ? labChoiceLabel(input.lab) : null;

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
    description: [`${event.title}: ${order.seatLabels.join(", ")}`, itemLabel]
      .filter(Boolean)
      .join(" · "),
    amount: order.amountMnt,
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
 */
export async function attachInvoice(input: {
  orderId: string;
  userId: string;
  description: string;
  amount: number;
}) {
  try {
    const invoice = await createInvoice({
      senderInvoiceNo: input.orderId,
      receiverCode: input.userId,
      description: input.description.slice(0, 255),
      amount: input.amount,
      callbackUrl: callbackUrl(input.orderId),
    });
    await prisma.order.update({
      where: { id: input.orderId },
      data: {
        qpayInvoiceId: invoice.invoiceId,
        qpayQrText: invoice.qrText,
        qpayQrImage: invoice.qrImage,
        qpayShortUrl: invoice.shortUrl,
        qpayUrls: invoice.urls as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    await releaseOrder(input.orderId, "CANCELLED");
    console.error("QPay invoice creation failed", error);
    throw new BookingError("PAYMENT_UNAVAILABLE", "Нэхэмжлэх үүсгэж чадсангүй. Дахин оролдоно уу.");
  }
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
 * once the hold runs out. Safe to call from the status poller and the QPay callback.
 */
export async function syncOrder(orderId: string, { force = false } = {}) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.qpayInvoiceId) return order;
  // Expired orders are only re-checked when QPay calls back (a late payment).
  if (order.status !== "PENDING" && !(force && order.status === "EXPIRED")) return order;

  const now = Date.now();
  if (!force && order.checkedAt && now - order.checkedAt.getTime() < CHECK_INTERVAL_MS) {
    return order;
  }
  await prisma.order.update({ where: { id: order.id }, data: { checkedAt: new Date(now) } });

  const payment = await checkInvoicePayment(order.qpayInvoiceId);
  if (payment.paid && payment.paidAmount >= order.amountMnt) {
    await confirmPaid(order, payment.paymentId);
  } else if (order.status === "PENDING" && order.expiresAt.getTime() < now) {
    await cancelInvoice(order.qpayInvoiceId);
    await releaseOrder(order.id, "EXPIRED");
  }
  return prisma.order.findUnique({ where: { id: order.id } });
}
