import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/services/razorpay";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { activateMockGift, getMockGiftById, recordMockPayment } from "@/lib/mockStore";
import { env } from "@/lib/env";

/**
 * Verifies the Razorpay payment signature server-side and ONLY THEN
 * activates the gift (spec section 8: "Never activate the final gift based
 * only on frontend payment success"). This is the single choke point every
 * gift must pass through before it becomes reachable at /gift/[token].
 *
 * Every attempt — success or failure — is recorded against the gift's own
 * `amount` (set at creation time, spec section 9) so the admin dashboard's
 * Orders table and failed-payment count (spec section 10) reflect real
 * charges rather than a hardcoded placeholder.
 */
export async function POST(request: NextRequest) {
  const { giftId, orderId, paymentId, signature } = (await request.json()) as {
    giftId: string;
    orderId: string;
    paymentId: string;
    signature: string;
  };

  const validSignature = verifyRazorpaySignature({ orderId, paymentId, signature });

  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: giftRow } = await admin.from("gifts").select("amount").eq("id", giftId).maybeSingle();
    const amount = giftRow?.amount ?? 0;

    if (!validSignature) {
      await admin
        .from("payments")
        .insert({ gift_id: giftId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature, amount, status: "failed" });
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + env.app.giftExpiryDays * 86_400_000).toISOString();
    const { data: payment } = await admin
      .from("payments")
      .insert({
        gift_id: giftId,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        amount,
        status: "captured",
      })
      .select()
      .single();

    const { data: gift, error } = await admin
      .from("gifts")
      .update({
        status: "active",
        payment_status: "paid",
        payment_id: payment?.id ?? null,
        completed_at: new Date().toISOString(),
        expires_at: expiresAt,
      })
      .eq("id", giftId)
      .select("gift_token")
      .single();

    if (error || !gift) {
      return NextResponse.json({ error: "Failed to activate gift." }, { status: 500 });
    }
    return NextResponse.json({ giftToken: gift.gift_token });
  }

  const existing = getMockGiftById(giftId);
  const amount = existing?.amount ?? 0;

  if (!validSignature) {
    recordMockPayment({ giftId, orderId, paymentId, amount, status: "failed" });
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Gift not found." }, { status: 404 });
  }
  recordMockPayment({ giftId, orderId, paymentId, amount, status: "captured" });
  const activated = activateMockGift(giftId, env.app.giftExpiryDays);
  return NextResponse.json({ giftToken: activated!.giftToken });
}
