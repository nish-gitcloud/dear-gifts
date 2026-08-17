"use client";

import { use, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

function mockPaymentId(): string {
  return `pay_mock_${Date.now()}`;
}

/**
 * Checkout for a *duplicated* gift (spec section 6 — "Create New Gift"
 * reuses a previous gift's content but always requires a fresh payment).
 * Unlike /create/[occasion]/summary, the gift row already exists — created
 * by POST /api/manage/[token]/duplicate — so this only runs the
 * order-create → mock pay → verify leg of the pipeline, never a second
 * /api/gifts POST.
 */
function DuplicateCheckout({ giftId }: { giftId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = Number(searchParams.get("amount") ?? "0");
  const giftToken = searchParams.get("token") ?? "";
  const manageToken = searchParams.get("manage") ?? "";
  const occasion = searchParams.get("occasion") ?? "birthday";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function payAndActivate() {
    setLoading(true);
    setError(null);
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Could not start payment.");

      const paymentId = mockPaymentId();
      const mockSignature = `mock_sig_${orderData.order.id}_${paymentId}`;

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId, orderId: orderData.order.id, paymentId, signature: mockSignature }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error ?? "Payment wasn't completed.");

      const manageParam = manageToken ? `&manage=${manageToken}` : "";
      router.push(`/create/${occasion}/success?token=${verifyData.giftToken}${manageParam}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
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

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

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
