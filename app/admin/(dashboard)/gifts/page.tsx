"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { giftReferenceCode } from "@/lib/paymentRef";

interface Gift {
  id: string;
  occasion: string;
  occasionTitle: string;
  recipientName: string;
  status: string;
  paymentStatus: string;
  amount: number;
  giftToken: string;
  createdAt: string;
  expiresAt: string | null;
  views: number;
}

const STATUS_CLASS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  pending_payment: "bg-amber-50 text-amber-700",
  expired: "bg-black/5 text-black/50",
  archived: "bg-black/5 text-black/50",
  draft: "bg-black/5 text-black/50",
};

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<Gift[] | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  function loadGifts() {
    fetch("/api/admin/gifts")
      .then((res) => res.json())
      .then((data) => setGifts(data.gifts ?? []));
  }

  useEffect(() => {
    loadGifts();
  }, []);

  async function activate(giftId: string) {
    if (!confirm("Confirm the customer's reference code matches a real payment you've received — activate this gift?")) {
      return;
    }
    setActivatingId(giftId);
    try {
      const res = await fetch(`/api/admin/gifts/${giftId}/activate`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Couldn't activate this gift.");
        return;
      }
      loadGifts();
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[#241A17]">Gifts</h1>
      <p className="mt-1 text-xs text-black/45">
        &quot;Ref&quot; is the short code a customer sends after paying via the manual payment link — match it before
        activating a pending gift.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-black/40">
            <tr>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Occasion</th>
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {gifts?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-black/40">
                  No gifts yet.
                </td>
              </tr>
            )}
            {gifts?.map((g) => (
              <tr key={g.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-[#241A17]">{g.recipientName}</td>
                <td className="px-4 py-3 text-black/60">{g.occasionTitle}</td>
                <td className="px-4 py-3 font-mono text-xs text-black/50">{giftReferenceCode(g.id)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[g.status] ?? STATUS_CLASS.draft}`}>
                    {g.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-black/70">₹{g.amount}</td>
                <td className="px-4 py-3 text-black/50">{g.views}</td>
                <td className="px-4 py-3 text-xs text-black/40">{new Date(g.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {g.status === "active" && (
                    <Link href={`/gift/${g.giftToken}`} target="_blank" className="text-xs font-medium text-[#E85C7B] underline">
                      View
                    </Link>
                  )}
                  {g.status === "pending_payment" && (
                    <button
                      type="button"
                      onClick={() => activate(g.id)}
                      disabled={activatingId === g.id}
                      className="touch-target rounded-full bg-[#E85C7B] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      {activatingId === g.id ? "Activating…" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {gifts === null && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-black/40">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
