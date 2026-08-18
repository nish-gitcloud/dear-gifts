import "server-only";
import { env } from "@/lib/env";

/**
 * Cashfree Payment Gateway adapter (replaces the earlier Razorpay
 * integration — spec sections 8 & 31 still apply: a gift is only ever
 * activated after the payment is confirmed server-side, never from
 * anything the browser alone reports).
 *
 * Unlike Razorpay, Cashfree doesn't gate live-mode payments behind a
 * "registered website" allow-list, which is exactly why this swap was
 * requested — no domain configuration step blocking checkout.
 */

// A real, released Cashfree API version (not a rolling "today's date"
// placeholder) — pinning this means a Cashfree API upgrade elsewhere can't
// silently change this app's request/response shape underneath it.
const CASHFREE_API_VERSION = "2023-08-01";

function baseUrl(): string {
  return env.cashfree.mode === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": env.cashfree.appId ?? "",
    "x-client-secret": env.cashfree.secretKey ?? "",
  };
}

/** Cashfree requires a 10-digit Indian phone number, digits only. */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10) || "9999999999";
}

/** customer_id must be 3-50 alphanumeric characters — strip everything else. */
function sanitizeId(raw: string, prefix: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "");
  return `${prefix}${cleaned}`.slice(0, 50);
}

export interface CashfreeOrder {
  orderId: string;
  paymentSessionId: string;
  mode: "sandbox" | "production";
}

/**
 * Creates a Cashfree order and returns the `payment_session_id` the
 * frontend's Cashfree JS SDK needs to open the checkout widget. Falls back
 * to a mock session (same Phase 1 pattern as the old Razorpay adapter) when
 * no Cashfree credentials are configured, so local dev without real keys
 * still exercises the full create → pay → verify pipeline.
 */
export async function createCashfreeOrder(params: {
  giftId: string;
  amountRupees: number;
  customerPhone: string;
  customerName?: string;
}): Promise<CashfreeOrder> {
  const orderId = sanitizeId(params.giftId, "order");

  if (!env.cashfree.isConfigured) {
    return { orderId: `order_mock_${Date.now()}`, paymentSessionId: `session_mock_${Date.now()}`, mode: env.cashfree.mode };
  }

  const res = await fetch(`${baseUrl()}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      order_id: orderId,
      order_amount: params.amountRupees,
      order_currency: "INR",
      customer_details: {
        customer_id: sanitizeId(params.giftId, "cust"),
        customer_phone: normalizePhone(params.customerPhone),
        customer_name: params.customerName || "Dear Gifts Customer",
      },
    }),
  });

  if (!res.ok) {
    // As with the Razorpay adapter before it: Cashfree's actual rejection
    // reason lives in this response body, and swallowing it here would just
    // reproduce the exact "generic 500, no clue why" problem that made the
    // Razorpay issue take so long to diagnose.
    const bodyText = await res.text().catch(() => "");
    console.error("Cashfree order creation failed:", res.status, bodyText);
    throw new Error(`Failed to create Cashfree order (HTTP ${res.status}): ${bodyText}`);
  }

  const data = (await res.json()) as { order_id: string; payment_session_id: string };
  return { orderId: data.order_id, paymentSessionId: data.payment_session_id, mode: env.cashfree.mode };
}

/**
 * The server-side source of truth for "did this actually get paid" — fetches
 * the order directly from Cashfree using our secret credentials, completely
 * independent of whatever the checkout widget told the browser. This is
 * what /api/payments/verify calls before ever activating a gift.
 */
export async function getCashfreeOrderStatus(orderId: string): Promise<string> {
  if (!env.cashfree.isConfigured) {
    // Mock mode: the create step above only ever hands out order ids
    // prefixed "order_mock_", and there's no real Cashfree order to check —
    // treat it as paid so local/dev testing can exercise the full flow.
    return orderId.startsWith("order_mock_") ? "PAID" : "TERMINATED";
  }

  const res = await fetch(`${baseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    console.error("Cashfree order status check failed:", res.status, bodyText);
    throw new Error(`Failed to check payment status (HTTP ${res.status}): ${bodyText}`);
  }

  const data = (await res.json()) as { order_status: string };
  return data.order_status; // "PAID" | "ACTIVE" | "EXPIRED" | "TERMINATED" | ...
}
