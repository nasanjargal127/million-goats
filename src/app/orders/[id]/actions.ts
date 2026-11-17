"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BookingError, startBalancePayment } from "@/lib/booking";

export type BalanceState = { error: string | null };

/** Creates the QPay invoice for an installment order's balance and reopens the order page. */
export async function payBalanceAction(
  orderId: string,
  _prev: BalanceState,
  _form: FormData,
): Promise<BalanceState> {
  const session = await getSession();
  if (!session) return { error: "Төлөхийн тулд нэвтэрнэ үү." };
  try {
    await startBalancePayment(orderId, session.user.id);
  } catch (error) {
    if (error instanceof BookingError) return { error: error.message };
    throw error;
  }
  redirect(`/orders/${orderId}`);
}
