"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOccasion } from "@/config/occasions";
import { useWizardStore } from "@/hooks/useWizardStore";
import { calculateWizardPrice } from "@/lib/wizardPricing";
import { getWrap } from "@/config/wraps";
import { trackEvent } from "@/lib/analyticsClient";
import { Button } from "@/components/ui/Button";
import { WrapIllustration, WRAP_COLORS, FALLBACK_WRAP_PALETTE } from "@/components/creator/fields/WrapPickerField";

// Module-level (not inside the component body) so this impure, time-based
// id generation is clearly outside React's render purity rules — it only
// ever runs from the payAndCreate click handler below, never during render.
function mockPaymentId(): string {
  return `pay_mock_${Date.now()}`;
}

// Minimal shape of the global Razorpay Checkout.js constructor — the real
// script (loaded on demand below) attaches this to `window`. Typed loosely
// on purpose: we only ever touch the handful of fields this page uses.
interface RazorpayCheckoutInstance {
  open: () => void;
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
}
interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  theme?: { color?: string };
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

// Loads Razorpay's Checkout.js exactly once and resolves once
// `window.Razorpay` is actually available — every other real Razorpay
// integration (web or mobile-web) goes through this same hosted script,
// there is no npm package that replaces it for client-side checkout.
let razorpayScriptPromise: Promise<void> | null = null;
function loadRazorpayCheckout(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Couldn't load the payment window. Check your connection and try again."));
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

/**
 * Order summary + "Pay & Create" (spec sections 8 & 31). In this Phase 1
 * scaffold (no live Razorpay keys), payment is simulated end-to-end through
 * the same create → order → verify pipeline a real integration would use —
 * swapping in the real Razorpay Checkout script later requires no changes
 * to this activation flow, only to services/razorpay.ts.
 *
 * Styled as a single "ready to publish" moment (dark, hero-led, a short
 * feature list, one clear price) rather than a plain itemized receipt — the
 * itemized breakdown is still here for transparency, just tucked under a
 * disclosure instead of leading the page, since our pricing genuinely is
 * itemized/admin-configurable (spec section 9), not a flat fee.
 */
export default function SummaryPage({ params }: { params: Promise<{ occasion: string }> }) {
  const { occasion: occasionId } = use(params);
  const occasion = getOccasion(occasionId);
  const store = useWizardStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!occasion) notFound();

  const price = calculateWizardPrice(occasion, store.values);
  const recipientName = String(store.values.recipient?.recipientName ?? "your special someone");
  const wrap = getWrap(String(store.values["gift-wrap"]?.wrapId ?? ""));
  const wrapPalette = WRAP_COLORS[wrap.id] ?? FALLBACK_WRAP_PALETTE;

  const features = [
    "Animated 3D gift & secret PIN unlock",
    ...price.lines.filter((l) => l.label !== "Base Gift").map((l) => l.label),
    "Private shareable link — yours to send whenever you're ready",
  ];

  // Shared by both the real Razorpay flow and the mock (no-keys-configured)
  // flow below — hits the one server-side choke point that actually
  // activates a gift, then navigates to the success page.
  async function verifyAndFinish(payload: { giftId: string; orderId: string; paymentId: string; signature: string; manageToken?: string }) {
    const verifyRes = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        giftId: payload.giftId,
        orderId: payload.orderId,
        paymentId: payload.paymentId,
        signature: payload.signature,
      }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(verifyData.error ?? "Payment wasn't completed. Your gift has not been published.");

    store.reset();
    const manageParam = payload.manageToken ? `&manage=${payload.manageToken}` : "";
    router.push(`/create/${occasion!.id}/success?token=${verifyData.giftToken}${manageParam}`);
  }

  async function payAndCreate() {
    trackEvent("checkout_started", { occasion: occasion!.id });
    setLoading(true);
    setError(null);
    try {
      const giftRes = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion: occasion!.id, values: store.values }),
      });
      const giftData = await giftRes.json();
      if (!giftRes.ok) throw new Error(giftData.error ?? "Could not create your gift.");

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: giftData.amount }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Could not start payment.");

      const isMockOrder = String(orderData.order.id).startsWith("order_mock_");

      if (!isMockOrder && orderData.keyId) {
        // --- Real Razorpay Checkout ---------------------------------------
        // Live keys are configured, so this is a genuine charge: open
        // Razorpay's own payment window and only ever proceed from its
        // `handler` callback, using the real payment id + signature it
        // returns — never anything constructed on the client.
        await loadRazorpayCheckout();
        setLoading(false);
        const rzp = new window.Razorpay!({
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          order_id: orderData.order.id,
          name: "Dear Gifts",
          description: `${occasion!.title} gift for ${recipientName}`,
          theme: { color: "#E85C7B" },
          handler: (response) => {
            setLoading(true);
            verifyAndFinish({
              giftId: giftData.giftId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              manageToken: giftData.manageToken,
            })
              .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong."))
              .finally(() => setLoading(false));
          },
          modal: {
            ondismiss: () => {
              setError("Payment was cancelled.");
            },
          },
        });
        rzp.on("payment.failed", (response) => {
          setError(response.error?.description ?? "Payment failed. Please try again.");
        });
        rzp.open();
        return;
      }

      // --- Mock checkout (no live Razorpay keys configured) ---------------
      const paymentId = mockPaymentId();
      const mockSignature = `mock_sig_${orderData.order.id}_${paymentId}`;
      await verifyAndFinish({
        giftId: giftData.giftId,
        orderId: orderData.order.id,
        paymentId,
        signature: mockSignature,
        manageToken: giftData.manageToken,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0714] px-6 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#14101F] p-8 shadow-2xl">
        <div className="mx-auto flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/5">
            <WrapIllustration category={wrap.category} palette={wrapPalette} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">
          Ready to Publish
        </p>
        <h1 className="font-display mt-2 text-center text-2xl font-semibold text-white">
          {occasion.title} surprise for {recipientName}
        </h1>

        <ul className="mt-6 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-white/70">
              <span className="mt-0.5 text-[#E85C7B]">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex items-end justify-center gap-1.5">
          <span className="font-display text-4xl font-semibold text-white">₹{price.total}</span>
          <span className="mb-1 text-xs uppercase tracking-wide text-white/40">one-time</span>
        </div>

        <button
          type="button"
          onClick={() => setShowBreakdown((s) => !s)}
          className="mx-auto mt-2 block text-xs text-white/40 underline decoration-white/20 underline-offset-2 hover:text-white/60"
        >
          {showBreakdown ? "Hide breakdown" : "See price breakdown"}
        </button>
        {showBreakdown && (
          <div className="mt-3 divide-y divide-white/10 rounded-xl bg-white/5 text-sm">
            {price.lines.map((line) => (
              <div key={line.label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-white/60">{line.label}</span>
                <span className="font-medium text-white/85">₹{line.amount}</span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-5 flex items-center justify-center gap-1.5 rounded-full bg-white/5 px-3 py-2 text-center text-xs text-white/60">
          ✏️ Fully editable after publishing — using your private manage link, for free
        </p>

        {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}

        <div className="mt-6">
          <Button className="w-full" onClick={payAndCreate} disabled={loading}>
            {loading ? "Publishing your gift..." : "✨ Publish My Gift"}
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-white/35">
          Your gift is only ever activated after payment is verified. By publishing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-white/60">
            Terms
          </Link>
          , <Link href="/privacy-policy" className="underline hover:text-white/60">Privacy</Link> &{" "}
          <Link href="/refund-policy" className="underline hover:text-white/60">
            Refund Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
