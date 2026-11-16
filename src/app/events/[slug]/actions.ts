"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BookingError, MAX_SEATS_PER_ORDER, reserveSeats } from "@/lib/booking";

export async function reserveSeatsAction(
  eventId: unknown,
  seatIds: unknown,
): Promise<{ error: string }> {
  const session = await getSession();
  if (!session) return { error: "Суудал захиалахын тулд нэвтэрнэ үү." };

  if (
    typeof eventId !== "string" ||
    !Array.isArray(seatIds) ||
    seatIds.length > MAX_SEATS_PER_ORDER ||
    !seatIds.every((s) => typeof s === "string")
  ) {
    return { error: "Буруу хүсэлт." };
  }

  let orderId: string;
  try {
    orderId = await reserveSeats({ userId: session.user.id, eventId, seatIds });
  } catch (error) {
    if (error instanceof BookingError) return { error: error.message };
    throw error;
  }
  redirect(`/orders/${orderId}`);
}
