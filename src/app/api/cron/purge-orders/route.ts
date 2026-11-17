import { type NextRequest, NextResponse } from "next/server";
import { expireOverdueBalances, purgeExpiredOrders } from "@/lib/booking";
import { cronAuthorized } from "@/lib/cron";

/**
 * Daily (see vercel.json): deletes unpaid orders that expired over an hour ago,
 * and releases the seats of installment orders whose balance is overdue.
 */
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const purged = await purgeExpiredOrders();
  console.log("Purged expired orders", purged);
  const balances = await expireOverdueBalances();
  console.log("Expired overdue balances", balances);
  return NextResponse.json({ ...purged, balances });
}
