import { NextRequest, NextResponse } from "next/server";
import { createCashfreeOrder } from "@/services/cashfree";

/**
 * Creates a Cashfree order for the given gift and hands back the
 * `payment_session_id` the frontend's Cashfree JS SDK needs to open the
 * checkout widget (see app/create/[occasion]/summary/page.tsx). `mode` tells
 * the same frontend whether to initialize the SDK against Cashfree's
 * sandbox or production environment — safe to expose, it's not a secret.
 */
export async function POST(request: NextRequest) {
  const { amount, giftId, customerPhone, customerName } = (await request.json()) as {
    amount: number;
    giftId: string;
    customerPhone: string;
    customerName?: string;
  };
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 422 });
  }
  if (!giftId) {
    return NextResponse.json({ error: "Missing gift reference." }, { status: 422 });
  }
  try {
    const order = await createCashfreeOrder({
      giftId,
      amountRupees: amount,
      customerPhone: customerPhone ?? "",
      customerName,
    });
    return NextResponse.json({ order });
  } catch (err) {
    // An uncaught throw here would produce a bare 500 with no body at all,
    // which makes the client's `await res.json()` fail with a useless
    // "Unexpected end of JSON input" instead of the real reason. Logging
    // server-side + always returning JSON keeps the actual Cashfree failure
    // visible in Vercel's Logs tab.
    console.error("Cashfree create-order failed:", err);
    return NextResponse.json({ error: "Could not start payment. Please try again in a moment." }, { status: 500 });
  }
}
