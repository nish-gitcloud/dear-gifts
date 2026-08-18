import "server-only";
import { createHmac } from "crypto";
import { env } from "@/lib/env";

export interface RazorpayOrder {
  id: string;
  amount: number; // in paise
  currency: string;
}

/**
 * Creates a Razorpay order. In Phase 1 (no credentials), returns a mock
 * order so the checkout UI can be built and the create → pay → verify
 * pipeline can be exercised end-to-end before real keys exist.
 *
 * IMPORTANT: the final gift must only ever be activated after
 * `verifyRazorpaySignature` succeeds server-side — never on frontend
 * "payment success" alone (spec section 8).
 */
export async function createRazorpayOrder(amountRupees: number): Promise<RazorpayOrder> {
  const amountPaise = Math.round(amountRupees * 100);

  if (!env.razorpay.isConfigured) {
    return { id: `order_mock_${Date.now()}`, amount: amountPaise, currency: "INR" };
  }

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({ amount: amountPaise, currency: "INR" }),
  });
  if (!res.ok) {
    // Razorpay's actual rejection reason (e.g. "account not activated",
    // "authentication failed") lives in this response body — the old code
    // discarded it and threw a generic message, which meant Vercel's Logs
    // could tell us THAT it failed but never WHY. Surfacing the real body
    // here is the difference between guessing and knowing the fix.
    const bodyText = await res.text().catch(() => "");
    console.error("Razorpay order creation failed:", res.status, bodyText);
    throw new Error(`Failed to create Razorpay order (HTTP ${res.status}): ${bodyText}`);
  }
  return res.json();
}

/**
 * Verifies the HMAC-SHA256 signature Razorpay returns after checkout.
 * This is the server-side gate that must pass before a gift's payment
 * status is ever marked "paid".
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!env.razorpay.isConfigured) {
    // Mock mode: accept a deterministic fake signature so local dev/testing
    // can exercise the full success flow without real Razorpay keys.
    return params.signature === `mock_sig_${params.orderId}_${params.paymentId}`;
  }
  const expected = createHmac("sha256", env.razorpay.keySecret!)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return expected === params.signature;
}
