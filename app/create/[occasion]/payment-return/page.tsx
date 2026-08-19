"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWizardStore } from "@/hooks/useWizardStore";

/**
 * Where Cashfree's hosted Payment Link sends the customer back to after
 * checkout (see services/cashfree.ts's `returnUrl` and
 * app/create/[occasion]/summary/page.tsx's full-page redirect). This page's
 * only job is to call /api/payments/verify — which independently confirms
 * the real payment status with Cashfree using our own secret credentials —
 * and only then move on to the success page. Nothing about "was this paid"
 * is ever decided from the redirect itself (spec section 8): a customer
 * could close the tab, hit back, or the redirect could be spoofed, and none
 * of that would activate a gift without this server-side check passing.
 */
export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const params = useParams<{ occasion: string }>();
  const router = useRouter();
  const store = useWizardStore();
  const [status, setStatus] = useState<"checking" | "failed">("checking");
  const [error, setError] = useState<string | null>(null);

  const giftId = searchParams.get("giftId");
  const manageToken = searchParams.get("manage");

  useEffect(() => {
    if (!giftId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- bailing out of a missing-param case, not syncing external state.
      setStatus("failed");
      setError("Missing gift reference — please start again from your gift's summary.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("failed");
          setError(data.error ?? "Payment wasn't completed. Your gift has not been published.");
          return;
        }
        store.reset();
        const manageParam = manageToken ? `&manage=${manageToken}` : "";
        router.replace(`/create/${params.occasion}/success?token=${data.giftToken}${manageParam}`);
      } catch {
        if (!cancelled) {
          setStatus("failed");
          setError("Couldn't confirm your payment. Please check your connection and try again.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0714] px-6 text-center">
      {status === "checking" ? (
        <>
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E85C7B]" />
          <p className="text-sm text-white/70">Confirming your payment…</p>
        </>
      ) : (
        <>
          <span className="text-3xl">😕</span>
          <p className="max-w-sm text-sm text-white/70">{error}</p>
          <Link
            href={`/create/${params.occasion}/summary`}
            className="mt-2 rounded-full bg-[#E85C7B] px-5 py-2.5 text-sm font-medium text-white"
          >
            Back to Summary
          </Link>
        </>
      )}
    </main>
  );
}
