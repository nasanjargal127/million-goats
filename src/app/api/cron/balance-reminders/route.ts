import { type NextRequest, NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cron";
import { sendBalanceReminders } from "@/lib/installment-emails";

/**
 * Daily at 10:00 Ulaanbaatar time (see vercel.json): emails Premium buyers whose
 * balance is due within a week, and again on the last day.
 */
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendBalanceReminders();
  console.log("Balance reminders", result);
  return NextResponse.json(result);
}
