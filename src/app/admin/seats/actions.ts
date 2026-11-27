"use server";

import { refresh } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { AdminSeatError, addManualLabBookingNow, cancelLabOrderNow } from "@/lib/admin-seats";
import { getSession } from "@/lib/auth";
import { syncOrder } from "@/lib/booking";
import { parseLabChoice } from "@/lib/lab/packages";
import { ROOM_NAMES, type RoomId } from "@/lib/lab/seats";

export type AdminSeatState = { error: string | null; done: string | null };

async function signedInAdmin() {
  const session = await getSession();
  return session !== null && (await isAdmin(session.user.id));
}

/** Books a Lab seat for an existing account by email, as already paid. */
export async function addManualBookingAction(
  _prev: AdminSeatState,
  form: FormData,
): Promise<AdminSeatState> {
  if (!(await signedInAdmin())) return { error: "Зөвхөн админ нэмэх боломжтой.", done: null };

  const email = String(form.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Зөв email оруулна уу.", done: null };
  }
  const seatId = String(form.get("seat") ?? "");
  const lab = parseLabChoice({
    labPackage: form.get("package"),
    teacher: form.get("teacher") || null,
    withPsychologist: form.get("psychologist") === "on",
    parts: 1,
  });
  if (!lab) return { error: "Багц болон багшаа сонгоно уу.", done: null };

  try {
    await addManualLabBookingNow({ email, seatId, lab });
  } catch (error) {
    if (error instanceof AdminSeatError) return { error: error.message, done: null };
    throw error;
  }
  refresh();
  const [room, number] = seatId.split("-");
  return {
    error: null,
    done: `${email}: ${ROOM_NAMES[room as RoomId]} ${number} суудал нэмэгдлээ.`,
  };
}

/** Cancels the order holding a Lab seat and frees the seat. */
export async function cancelSeatOrderAction(
  orderId: string,
  _prev: AdminSeatState,
  _form: FormData,
): Promise<AdminSeatState> {
  if (!(await signedInAdmin())) return { error: "Зөвхөн админ цуцлах боломжтой.", done: null };

  // A payment may be in flight: record it first, so it is not lost with the order.
  try {
    await syncOrder(orderId, { force: true });
  } catch (error) {
    console.error(`Could not check order ${orderId} with QPay before cancelling`, error);
  }
  try {
    await cancelLabOrderNow(orderId);
  } catch (error) {
    if (error instanceof AdminSeatError) return { error: error.message, done: null };
    throw error;
  }
  refresh();
  return { error: null, done: "Цуцлагдлаа." };
}
