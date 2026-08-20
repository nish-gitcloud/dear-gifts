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
import { trackMetaEvent } from "@/lib/metaPixel";
import { Button } from "@/components/ui/Button";
import { WrapIllustration, WRAP_COLORS, FALLBACK_WRAP_PALETTE } from "@/components/creator/fields/WrapPickerField";

/**
 * Order summary + "Pay & Create" (spec sections 8 & 31).
 *
 * Payment currently routes through a *manual* step (see
 * app/create/[occasion]/pay-manual) rather than the fully-automatic
 * Cashfree Payment Link flow this app is built for: Cashfree's
 * link-creation API isn't enabled on this account yet
 * ("link_creation_api is not enabled or approved"), on top of both
 * Razorpay and Cashfree's own-domain checkout having already rejected this
 * app's website-whitelisting request (their compliance flagged the
 * registered business as a mismatch for this specific app). A single
 * reusable Payment Link/Page created once from the Cashfree Dashboard
 * covers the flat price in the meantime, with a short reference code the
 * creator sends after paying so /admin can activate the gift by hand.
 *
 * Once Cashfree enables link-creation-api, this only needs to change back
 * to calling /api/payments/create-order + redirecting to the real per-gift
 * link — services/cashfree.ts and the payment-return page are already
 * built for that and untouched by this stopgap.
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

  async function payAndCreate() {
    trackEvent("checkout_started", { occasion: occasion!.id });
    trackMetaEvent("InitiateCheckout", { value: price.total, currency: "INR", content_name: occasion!.id });
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

      // The gift is saved (pending_payment) — hand off to the manual
      // payment step (see this file's top comment for why it's manual
      // right now). store.reset() happens once /admin actually activates
      // this gift and the creator returns via their management link, not
      // here — the wizard draft should stay intact if they close this tab
      // before finishing payment.
      const manageParam = giftData.manageToken ? `&manage=${giftData.manageToken}` : "";
      router.push(`/create/${occasion!.id}/pay-manual?giftId=${giftData.giftId}${manageParam}`);
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
