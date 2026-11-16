import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrderForUser, syncOrder } from "@/lib/booking";

// Polled by the order page while a payment is pending.
export async function GET(_request: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const owned = await getOrderForUser(id, session.user.id);
  if (!owned) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const order = await syncOrder(id);
    return NextResponse.json({ status: order?.status ?? owned.status });
  } catch (error) {
    console.error("Order sync failed", error);
    return NextResponse.json({ status: owned.status });
  }
}
