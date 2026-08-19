"use client";

import { useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { giftReferenceCode } from "@/lib/paymentRef";

/**
 * Temporary manual-payment step (see lib/env.ts's `manualPayment` config
 * and the comment on services/cashfree.ts) — used while Cashfree's
 * Payment Link *creation API* is still pending approval on this account.
 * A single reusable Payment Link/Page (created once from the Dashboard,
 * not via API) collects the flat price from every customer; this page's
 * job is to make that handoff clear and give the creator a short reference
 * code to send after paying, so /admin can match it to the right gift and
 * activate it with one click (see app/admin/(dashboard)/gifts/page.tsx).
 *
 * This is a stopgap, not the final design: once Cashfree enables
 * link-creation-api, /api/payments/create-order goes back to generating a
 * unique link per gift and this whole manual step disappears — nothing
 * about how gifts are *created* or *stored* changes either way.
 */
export default function PayManualPage() {
  const searchParams = useSearchParams();
  const params = useParams<{ occasion: string }>();
  const giftId = searchParams.get("giftId") ?? "";
  const manageToken = searchParams.get("manage");
  const [copied, setCopied] = useState(false);

  const refCode = giftId ? giftReferenceCode(giftId) : "";
  const paymentLinkUrl = process.env.NEXT_PUBLIC_PAYMENT_LINK_URL ?? "";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const whatsappMessage = encodeURIComponent(
    `Hi! I just paid ₹199 for my Dear Gifts surprise. My reference code is ${refCode}.`
  );
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}` : "";

  function copyCode() {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!giftId) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-black/60">
          Missing gift reference.{" "}
          <Link href={`/create/${params.occasion}/summary`} className="underline">
            Go back
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-[#E85C7B]">One Step Left</p>
      <h1 className="font-display mt-2 text-2xl font-semibold text-[#241A17]">Complete your payment to activate</h1>
      <p className="mt-2 text-sm text-black/55">
        Your gift is saved. Pay ₹199 using the button below, then send us your reference code so we can activate it —
        usually within a couple of hours.
      </p>

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Step 1</p>
        <p className="mt-1 text-sm text-black/70">Pay ₹199 on our secure Cashfree payment page.</p>
        {paymentLinkUrl ? (
          <a
            href={paymentLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-full bg-[#E85C7B] px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Pay ₹199 Now
          </a>
        ) : (
          <p className="mt-4 text-sm text-red-500">Payment link isn&apos;t configured yet.</p>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-black/40">Step 2</p>
        <p className="mt-1 text-sm text-black/70">After paying, send us this reference code so we can find your gift:</p>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-dashed border-black/15 bg-[#fffaf7] px-4 py-3">
          <span className="font-display text-xl font-semibold tracking-wide text-[#241A17]">{refCode}</span>
          <button
            type="button"
            onClick={copyCode}
            className="touch-target shrink-0 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-[#241A17] hover:bg-black/10"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-full bg-[#25D366] px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Send on WhatsApp
          </a>
        ) : (
          <p className="mt-3 text-xs text-black/45">Contact us with this code to activate your gift.</p>
        )}
      </div>

      {manageToken && (
        <p className="mt-6 text-center text-xs text-black/40">
          Save this link — once your gift is activated, your shareable link will appear here automatically:{" "}
          <Link href={`/manage/${manageToken}`} className="break-all font-medium text-[#E85C7B] underline">
            /manage/{manageToken}
          </Link>
        </p>
      )}
    </main>
  );
}
