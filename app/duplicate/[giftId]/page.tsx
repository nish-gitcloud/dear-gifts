"use client";

import { use, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Checkout for a *duplicated* gift (spec section 6 — "Create New Gift"
 * reuses a previous gift's content but always requires a fresh payment).
 * Unlike /create/[occasion]/summary, the gift row already exists — created
 * by POST /api/manage/[token]/duplicate — so this only hands off to the
 * same manual-payment step (see app/create/[occasion]/pay-manual and its
 * top comment for why payment is manual right now rather than the
 * automatic Cashfree Payment Link flow this app is built for).
 */
function DuplicateCheckout({ giftId }: { giftId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = Number(searchParams.get("amount") ?? "0");
  const giftToken = searchParams.get("token") ?? "";
  const manageToken = searchParams.get("manage") ?? "";
  const occasion = searchParams.get("occasion") ?? "birthday";
  const [loading, setLoading] = useState(false);

  function payAndActivate() {
    setLoading(true);
    const manageParam = manageToken ? `&manage=${manageToken}` : "";
    router.push(`/create/${occasion}/pay-manual?giftId=${giftId}${manageParam}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-[#E85C7B]">New Gift From a Duplicate</p>
      <h1 className="font-display mt-2 text-2xl font-semibold text-[#241A17]">
        Everything&apos;s copied — just confirm payment to activate it
      </h1>
      <p className="mt-2 text-sm text-black/55">
        This creates a brand-new surprise with a fresh link and PIN status. Nothing from the original gift is
        affected.
      </p>

      <div className="mt-8 flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm">
        <span className="font-semibold text-[#241A17]">Total</span>
        <span className="font-display text-xl font-semibold text-[#241A17]">₹{amount}</span>
      </div>

      {giftId && giftToken ? (
        <div className="mt-8">
          <Button className="w-full" onClick={payAndActivate} disabled={loading}>
            {loading ? "Activating..." : "Pay & Activate"}
          </Button>
        </div>
      ) : (
        <p className="mt-8 text-sm text-red-500">Missing gift details — please go back and duplicate again.</p>
      )}
    </main>
  );
}

export default function DuplicateCheckoutPage({ params }: { params: Promise<{ giftId: string }> }) {
  const { giftId } = use(params);
  return (
    <Suspense fallback={null}>
      <DuplicateCheckout giftId={giftId} />
    </Suspense>
  );
}
