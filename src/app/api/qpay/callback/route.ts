import { type NextRequest, NextResponse } from "next/server";
import { syncOrder, verifyOrderSignature } from "@/lib/booking";

// QPay calls the callback_url we registered on the invoice. The call itself is
// not trusted: it only triggers a server-side payment check against QPay.
async function handle(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order") ?? "";
  const sig = request.nextUrl.searchParams.get("sig") ?? "";
  if (!orderId || !verifyOrderSignature(orderId, sig)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    await syncOrder(orderId, { force: true });
  } catch (error) {
    console.error("QPay callback sync failed", error);
    return NextResponse.json({ error: "retry" }, { status: 502 });
  }
  return new NextResponse("SUCCESS", { status: 200 });
}

export const GET = handle;
export const POST = handle;
