"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BookingError } from "@/lib/booking";
import { createMerchOrder, MAX_MERCH_QUANTITY } from "@/lib/merch";

export type MerchFormState = { error: string | null };

const PHONE = /^\+?\d{8,15}$/;

export async function buyMerchAction(
  _prev: MerchFormState,
  form: FormData,
): Promise<MerchFormState> {
  const session = await getSession();
  if (!session) return { error: "Захиалахын тулд нэвтэрнэ үү." };

  const variantId = String(form.get("variantId") ?? "");
  const quantity = Number(form.get("quantity"));
  const phone = String(form.get("phone") ?? "").replace(/[\s-]/g, "");

  if (!variantId) return { error: "Загвар, хэмжээгээ сонгоно уу." };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_MERCH_QUANTITY) {
    return { error: `1–${MAX_MERCH_QUANTITY} ширхэг сонгоно уу.` };
  }
  if (!PHONE.test(phone)) return { error: "Утасны дугаараа зөв оруулна уу." };

  let orderId: string;
  try {
    orderId = await createMerchOrder({
      userId: session.user.id,
      variantId,
      quantity,
      phone,
    });
  } catch (error) {
    if (error instanceof BookingError) return { error: error.message };
    throw error;
  }
  redirect(`/orders/${orderId}`);
}
