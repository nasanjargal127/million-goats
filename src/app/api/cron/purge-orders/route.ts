import { timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { expireOverdueBalances, purgeExpiredOrders } from "@/lib/booking";

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; anything else is refused. */
function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Daily (see vercel.json): deletes unpaid orders that expired over an hour ago,
 * and releases the seats of installment orders whose balance is overdue.
 */
export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const purged = await purgeExpiredOrders();
  console.log("Purged expired orders", purged);
  const balances = await expireOverdueBalances();
  console.log("Expired overdue balances", balances);
  return NextResponse.json({ ...purged, balances });
}
