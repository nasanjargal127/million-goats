"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BookingError, reserveSeats } from "@/lib/booking";
import { prisma } from "@/lib/db";
import { LAB_EVENT_SLUG, toDbSeat } from "@/lib/lab/seats";

/** Holds one Trading Lab seat (e.g. "A-7") and sends the user to the QPay payment page. */
export async function reserveLabSeatAction(seatId: unknown): Promise<{ error: string }> {
  const session = await getSession();
  if (!session) return { error: "Захиалахын тулд нэвтэрнэ үү." };

  const spot = typeof seatId === "string" ? toDbSeat(seatId) : null;
  if (!spot) return { error: "Буруу суудал." };

  const seat = await prisma.seat.findFirst({
    where: { event: { slug: LAB_EVENT_SLUG, published: true }, row: spot.row, number: spot.number },
    select: { id: true, eventId: true },
  });
  if (!seat) return { error: "Онлайн захиалга одоогоор нээгдээгүй байна." };

  let orderId: string;
  try {
    orderId = await reserveSeats({
      userId: session.user.id,
      eventId: seat.eventId,
      seatIds: [seat.id],
    });
  } catch (error) {
    if (error instanceof BookingError) return { error: error.message };
    throw error;
  }
  redirect(`/orders/${orderId}`);
}
