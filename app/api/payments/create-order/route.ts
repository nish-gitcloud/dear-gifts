import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/services/razorpay";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const { amount } = (await request.json()) as { amount: number };
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 422 });
  }
  try {
    const order = await createRazorpayOrder(amount);
    // key_id is safe to expose to the browser (Razorpay's own Checkout.js
    // widget requires it client-side) — only key_secret must stay
    // server-only, and that never leaves services/razorpay.ts.
    return NextResponse.json({ order, keyId: env.razorpay.isConfigured ? env.razorpay.keyId : undefined });
  } catch (err) {
    // An uncaught throw here previously produced a bare 500 with NO body at
    // all, which made the client's `await res.json()` blow up with
    // "Unexpected end of JSON input" — a useless message that hid the real
    // cause. Logging server-side + always returning JSON means the actual
    // Razorpay failure (e.g. live keys not yet activated / KYC pending) is
    // now visible in Vercel's Logs tab instead of guessed at.
    console.error("Razorpay create-order failed:", err);
    return NextResponse.json({ error: "Could not start payment. Please try again in a moment." }, { status: 500 });
  }
}
