import "server-only";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "./db";
import { type LabChoice, labChoiceLabel, labChoicePrice } from "./lab/packages";
import { fromDbSeat, LAB_EVENT_SLUG, ROOM_IDS, type RoomId, toDbSeat } from "./lab/seats";
import { cancelInvoice } from "./qpay";

/** A refusal the admin should read, e.g. an unknown email or a seat already taken. */
export class AdminSeatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminSeatError";
  }
}

type Db = Prisma.TransactionClient;

/** Orders that hold their seat: unpaid (within the hold), paid, or paying the balance. */
const CANCELLABLE: OrderStatus[] = ["PENDING", "PAID", "DEPOSIT_PAID"];

// ─── Reading ────────────────────────────────────────────────────────────────

/**
 * Every Lab seat in room order, with the order holding it. Lapsed holds count
 * as free, the same as on the public seat map. Null if the Lab event is missing.
 */
export async function getLabSeatBoard() {
  const event = await prisma.event.findUnique({
    where: { slug: LAB_EVENT_SLUG },
    select: {
      seats: {
        select: {
          row: true,
          number: true,
          status: true,
          heldUntil: true,
          order: {
            select: {
              id: true,
              status: true,
              itemLabel: true,
              createdAt: true,
              paidAt: true,
              depositPaidAt: true,
              qpayInvoiceId: true,
              depositInvoiceId: true,
              user: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });
  if (!event) return null;

  const now = new Date();
  return event.seats
    .flatMap((s) => {
      const id = fromDbSeat(s.row, s.number);
      if (!id) return [];
      const taken =
        s.status === "SOLD" || (s.status === "HELD" && s.heldUntil !== null && s.heldUntil > now);
      return [
        { id, room: id.split("-")[0] as RoomId, number: s.number, order: taken ? s.order : null },
      ];
    })
    .sort((a, b) => ROOM_IDS.indexOf(a.room) - ROOM_IDS.indexOf(b.room) || a.number - b.number);
}

// ─── Manual booking ─────────────────────────────────────────────────────────

/**
 * Gives a Lab seat to an existing account with a package, already paid (e.g.
 * bank transfer or cash). Such orders never get a QPay invoice, which is how
 * the sales page tells them apart. Throws AdminSeatError, rolling back, if the
 * email has no account or the seat is taken.
 */
async function addManualLabBooking(
  db: Db,
  input: { email: string; seatId: string; lab: LabChoice },
) {
  const email = input.email.trim();
  const user = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (!user) {
    throw new AdminSeatError(
      `${email} email-ээр бүртгэл олдсонгүй. Сурагч эхлээд сайтад бүртгүүлсэн байх ёстой.`,
    );
  }
  const spot = toDbSeat(input.seatId);
  if (!spot) throw new AdminSeatError("Суудлаа сонгоно уу.");
  const seat = await db.seat.findFirst({
    where: { event: { slug: LAB_EVENT_SLUG }, row: spot.row, number: spot.number },
    select: { id: true, eventId: true },
  });
  if (!seat) throw new AdminSeatError("Суудал олдсонгүй.");

  // Paid in full: installments only apply to QPay payments.
  const lab: LabChoice = { ...input.lab, parts: 1 };
  const now = new Date();
  const order = await db.order.create({
    data: {
      userId: user.id,
      eventId: seat.eventId,
      kind: "SEAT",
      status: "PAID",
      amountMnt: labChoicePrice(lab),
      seatLabels: [`${spot.row}-${spot.number}`],
      itemLabel: labChoiceLabel(lab),
      labPackage: lab.labPackage,
      teacher: lab.teacher,
      withPsychologist: lab.withPsychologist,
      expiresAt: now,
      paidAt: now,
    },
  });
  const sold = await db.seat.updateMany({
    where: {
      id: seat.id,
      OR: [{ status: "AVAILABLE" }, { status: "HELD", heldUntil: { lt: now } }],
    },
    data: { status: "SOLD", heldUntil: null, orderId: order.id },
  });
  if (sold.count !== 1) throw new AdminSeatError("Энэ суудал аль хэдийн захиалагдсан байна.");
  return order;
}

export function addManualLabBookingNow(input: Parameters<typeof addManualLabBooking>[1]) {
  return prisma.$transaction((tx) => addManualLabBooking(tx, input));
}

// ─── Cancelling ─────────────────────────────────────────────────────────────

/**
 * Cancels a Lab order and frees its seats. Money already paid is not refunded
 * here; the order leaves the sales totals. Returns the QPay invoice that is
 * still open (an unpaid order, or an installment's balance), to be cancelled.
 */
async function cancelLabOrder(db: Db, orderId: string) {
  const order = await db.order.findFirst({
    where: { id: orderId, kind: "SEAT", status: { in: CANCELLABLE } },
    select: { id: true, status: true, qpayInvoiceId: true },
  });
  if (!order) throw new AdminSeatError("Цуцлах захиалга олдсонгүй.");
  const ended = await db.order.updateMany({
    where: { id: order.id, status: order.status },
    data: { status: "CANCELLED" },
  });
  if (ended.count === 0) {
    throw new AdminSeatError("Захиалгын төлөв саяхан өөрчлөгдсөн. Хуудсаа дахин ачаална уу.");
  }
  await db.seat.updateMany({
    where: { orderId: order.id },
    data: { status: "AVAILABLE", heldUntil: null, orderId: null },
  });
  return { openInvoice: order.status === "PAID" ? null : order.qpayInvoiceId };
}

export async function cancelLabOrderNow(orderId: string) {
  const { openInvoice } = await prisma.$transaction((tx) => cancelLabOrder(tx, orderId));
  if (openInvoice) await cancelInvoice(openInvoice);
}
