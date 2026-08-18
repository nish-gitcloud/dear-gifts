import { NextRequest, NextResponse } from "next/server";
import { getCashfreeOrderStatus } from "@/services/cashfree";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { activateMockGift, getMockGiftById, recordMockPayment } from "@/lib/mockStore";
import { env } from "@/lib/env";

/**
 * Confirms payment server-side and ONLY THEN activates the gift (spec
 * section 8: "Never activate the final gift based only on frontend payment
 * success"). This is the single choke point every gift must pass through
 * before it becomes reachable at /gift/[token].
 *
 * Unlike the earlier Razorpay integration (which trusted a client-supplied
 * HMAC signature), this asks Cashfree directly — using our own secret
 * credentials — "what's the real status of this order?" via
 * getCashfreeOrderStatus(). The browser's own report of what happened in
 * the checkout widget is never taken as truth, only used to know when to
 * call this endpoint.
 *
 * The `payments` table's columns are still named razorpay_order_id /
 * razorpay_payment_id / razorpay_signature (from before this gateway swap)
 * — renaming them would mean an extra ALTER TABLE migration against the
 * already-live Supabase database for zero functional benefit, so this
 * route just keeps writing Cashfree's data into those same columns
 * (order id, and the raw order_status Cashfree returned).
 */
export async function POST(request: NextRequest) {
  const { giftId, orderId } = (await request.json()) as { giftId: string; orderId: string };

  let orderStatus: string;
  try {
    orderStatus = await getCashfreeOrderStatus(orderId);
  } catch (err) {
    console.error("Cashfree order status check failed during verify:", err);
    return NextResponse.json({ error: "Could not confirm your payment. Please try again." }, { status: 502 });
  }
  const isPaid = orderStatus === "PAID";

  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: giftRow } = await admin.from("gifts").select("amount").eq("id", giftId).maybeSingle();
    const amount = giftRow?.amount ?? 0;

    if (!isPaid) {
      await admin
        .from("payments")
        .insert({ gift_id: giftId, razorpay_order_id: orderId, razorpay_signature: orderStatus, amount, status: "failed" });
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + env.app.giftExpiryDays * 86_400_000).toISOString();
    const { data: payment } = await admin
      .from("payments")
      .insert({
        gift_id: giftId,
        razorpay_order_id: orderId,
        razorpay_signature: orderStatus,
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

  if (!isPaid) {
    recordMockPayment({ giftId, orderId, paymentId: orderStatus, amount, status: "failed" });
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Gift not found." }, { status: 404 });
  }
  recordMockPayment({ giftId, orderId, paymentId: orderStatus, amount, status: "captured" });
  const activated = activateMockGift(giftId, env.app.giftExpiryDays);
  return NextResponse.json({ giftToken: activated!.giftToken });
}
