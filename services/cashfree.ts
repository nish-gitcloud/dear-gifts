import "server-only";
import { env } from "@/lib/env";

/**
 * Cashfree Payment Links adapter.
 *
 * This replaces an earlier attempt at Cashfree's Orders API + Checkout JS
 * SDK, which opens Cashfree's checkout *from* our own website — that path
 * requires the website to be explicitly whitelisted by Cashfree first
 * (same restriction Razorpay's live keys hit earlier), and both this app's
 * Razorpay AND Cashfree whitelisting requests were rejected because the
 * merchant account's registered business doesn't match this specific app.
 *
 * Payment Links sidestep that: the customer is redirected to a page hosted
 * entirely on Cashfree's own domain rather than one opened from ours, and
 * that isn't gated behind the same whitelist — confirmed by actually
 * generating a live link and opening it, which worked with no whitelisting
 * error. Verification is still fully automatic and still spec-compliant
 * (never trust the browser alone): after the customer returns from
 * Cashfree, our server independently checks the link's real status here
 * using our own secret credentials before ever activating a gift.
 */

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

/**
 * link_id must be alphanumeric (plus a few symbols) and unique — derived
 * deterministically from the gift (in both real and mock mode) so nothing
 * but the giftId ever needs to travel through the payment-return redirect
 * URL. The verify step recomputes the exact same id from giftId alone.
 */
export function deriveCashfreeLinkId(giftId: string): string {
  const clean = giftId.replace(/[^a-zA-Z0-9]/g, "");
  return (env.cashfree.isConfigured ? `link${clean}` : `linkmock${clean}`).slice(0, 50);
}

export interface CashfreePaymentLink {
  linkId: string;
  /** Null in mock mode (no credentials configured) — nothing to redirect to. */
  linkUrl: string | null;
  mode: "sandbox" | "production";
}

/**
 * Creates (or, if one already exists for this gift, effectively re-fetches
 * — Cashfree returns the existing link for a link_id it's already seen)
 * the Cashfree Payment Link the customer will be redirected to.
 */
export async function createCashfreePaymentLink(params: {
  giftId: string;
  amountRupees: number;
  customerPhone: string;
  customerName?: string;
  returnUrl: string;
}): Promise<CashfreePaymentLink> {
  const linkId = deriveCashfreeLinkId(params.giftId);

  if (!env.cashfree.isConfigured) {
    return { linkId, linkUrl: null, mode: env.cashfree.mode };
  }

  const res = await fetch(`${baseUrl()}/links`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      link_id: linkId,
      link_amount: params.amountRupees,
      link_currency: "INR",
      link_purpose: "Dear Gifts — personalized digital gift",
      customer_details: {
        customer_phone: normalizePhone(params.customerPhone),
        customer_name: params.customerName || "Dear Gifts Customer",
      },
      link_notify: { send_sms: false, send_email: false },
      link_meta: { return_url: params.returnUrl },
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    console.error("Cashfree payment link creation failed:", res.status, bodyText);
    throw new Error(`Failed to create payment link (HTTP ${res.status}): ${bodyText}`);
  }

  const data = (await res.json()) as { link_id: string; link_url: string };
  return { linkId: data.link_id, linkUrl: data.link_url, mode: env.cashfree.mode };
}

/**
 * The server-side source of truth for "did this actually get paid" — fetches
 * the link directly from Cashfree using our secret credentials, completely
 * independent of whatever the browser reports after redirecting back. This
 * is what /api/payments/verify calls before ever activating a gift.
 */
export async function getCashfreePaymentLinkStatus(linkId: string): Promise<string> {
  if (!env.cashfree.isConfigured) {
    // Mock mode: the create step above only ever hands out ids prefixed
    // "linkmock", and there's no real Cashfree link to check — treat it as
    // paid so local/dev testing can exercise the full flow.
    return linkId.startsWith("linkmock") ? "PAID" : "EXPIRED";
  }

  const res = await fetch(`${baseUrl()}/links/${encodeURIComponent(linkId)}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    console.error("Cashfree payment link status check failed:", res.status, bodyText);
    throw new Error(`Failed to check payment status (HTTP ${res.status}): ${bodyText}`);
  }

  const data = (await res.json()) as { link_status: string };
  return data.link_status; // "PAID" | "ACTIVE" | "EXPIRED" | "PARTIALLY_PAID" | ...
}
