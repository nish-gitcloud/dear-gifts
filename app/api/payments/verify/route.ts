import { NextRequest, NextResponse } from "next/server";
import { deriveCashfreeLinkId, getCashfreePaymentLinkStatus } from "@/services/cashfree";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { activateMockGift, getMockGiftById, recordMockPayment } from "@/lib/mockStore";
import { env } from "@/lib/env";

/**
 * Confirms payment server-side and ONLY THEN activates the gift (spec
 * section 8: "Never activate the final gift based only on frontend payment
 * success"). This is the single choke point every gift must pass through
 * before it becomes reachable at /gift/[token].
 *
 * The Cashfree Payment Link id is derived from `giftId` alone
 * (deriveCashfreeLinkId — the same function used when the link was
 * created), never trusted from the request body. That means this endpoint
 * only needs `giftId` and always checks the *correct* link's real status
 * with Cashfree directly, using our own secret credentials — the browser's
 * own report of what happened after redirecting back from checkout is
 * never taken as truth, only used to know when to call this endpoint.
 *
 * The `payments` table's columns are still named razorpay_order_id /
 * razorpay_payment_id / razorpay_signature (from before this app switched
 * payment gateways) — renaming them would mean an extra ALTER TABLE
 * migration against the already-live Supabase database for zero functional
 * benefit, so this route just keeps writing Cashfree's data into those same
 * columns (the link id, and the raw link_status Cashfree returned).
 */
export async function POST(request: NextRequest) {
  const { giftId } = (await request.json()) as { giftId: string };
  if (!giftId) {
    return NextResponse.json({ error: "Missing gift reference." }, { status: 422 });
  }
  const linkId = deriveCashfreeLinkId(giftId);

  let linkStatus: string;
  try {
    linkStatus = await getCashfreePaymentLinkStatus(linkId);
  } catch (err) {
    console.error("Cashfree payment link status check failed during verify:", err);
    return NextResponse.json({ error: "Could not confirm your payment. Please try again." }, { status: 502 });
  }
  const isPaid = linkStatus === "PAID";

  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: giftRow } = await admin.from("gifts").select("amount").eq("id", giftId).maybeSingle();
    const amount = giftRow?.amount ?? 0;

    if (!isPaid) {
      await admin
        .from("payments")
        .insert({ gift_id: giftId, razorpay_order_id: linkId, razorpay_signature: linkStatus, amount, status: "failed" });
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + env.app.giftExpiryDays * 86_400_000).toISOString();
    const { data: payment } = await admin
      .from("payments")
      .insert({
        gift_id: giftId,
        razorpay_order_id: linkId,
        razorpay_signature: linkStatus,
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
    recordMockPayment({ giftId, orderId: linkId, paymentId: linkStatus, amount, status: "failed" });
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Gift not found." }, { status: 404 });
  }
  recordMockPayment({ giftId, orderId: linkId, paymentId: linkStatus, amount, status: "captured" });
  const activated = activateMockGift(giftId, env.app.giftExpiryDays);
  return NextResponse.json({ giftToken: activated!.giftToken });
}
