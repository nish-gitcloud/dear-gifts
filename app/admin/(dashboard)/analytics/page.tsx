"use client";

import { useEffect, useState } from "react";

interface CreatorFunnel {
  occasionSelected: number;
  wizardStepReached: number;
  previewReached: number;
  checkoutStarted: number;
  paymentCompleted: number;
  byOccasion: Record<string, number>;
}

interface RecipientFunnel {
  totalOpens: number;
  averagePinAttempts: number;
  completionRate: number;
  stageDropOff: Array<{ stage: string; count: number }>;
}

const CREATOR_STEPS: Array<{ key: keyof CreatorFunnel; label: string }> = [
  { key: "occasionSelected", label: "Occasion Selected" },
  { key: "wizardStepReached", label: "Reached Wizard" },
  { key: "previewReached", label: "Previewed Gift" },
  { key: "checkoutStarted", label: "Started Checkout" },
  { key: "paymentCompleted", label: "Completed Payment" },
];

/** Creator + recipient funnels (spec section 58) — every number here comes from real events written by app/api/analytics/event and the gift_views table, not sample/mock data. */
export default function AdminAnalyticsPage() {
  const [creatorFunnel, setCreatorFunnel] = useState<CreatorFunnel | null>(null);
  const [recipientFunnel, setRecipientFunnel] = useState<RecipientFunnel | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        setCreatorFunnel(data.creatorFunnel);
        setRecipientFunnel(data.recipientFunnel);
      });
  }, []);

  const maxCreator = creatorFunnel ? Math.max(1, creatorFunnel.occasionSelected) : 1;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[#241A17]">Analytics</h1>

      <div className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-black/40">Creator Funnel</h2>
        {!creatorFunnel ? (
          <p className="mt-4 text-sm text-black/40">Loading…</p>
        ) : (
          <div className="mt-4 space-y-2">
            {CREATOR_STEPS.map((step) => {
              const value = creatorFunnel[step.key] as number;
              const pct = Math.round((value / maxCreator) * 100);
              return (
                <div key={step.key} className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#241A17]">{step.label}</span>
                    <span className="text-black/60">{value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-black/5">
                    <div className="h-2 rounded-full bg-[#E85C7B]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-black/40">Recipient Funnel</h2>
        {!recipientFunnel ? (
          <p className="mt-4 text-sm text-black/40">Loading…</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-black/40">Gifts Opened</p>
                <p className="font-display mt-1 text-xl font-semibold text-[#241A17]">{recipientFunnel.totalOpens}</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-black/40">Avg PIN Attempts</p>
                <p className="font-display mt-1 text-xl font-semibold text-[#241A17]">
                  {recipientFunnel.averagePinAttempts.toFixed(1)}
                </p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-black/40">Completion Rate</p>
                <p className="font-display mt-1 text-xl font-semibold text-[#241A17]">
                  {Math.round(recipientFunnel.completionRate * 100)}%
                </p>
              </div>
            </div>

            {recipientFunnel.stageDropOff.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-black/50">Sessions&apos; furthest stage reached (drop-off)</p>
                <div className="mt-2 space-y-1.5">
                  {recipientFunnel.stageDropOff.map((s) => (
                    <div key={s.stage} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                      <span className="text-black/70">{s.stage}</span>
                      <span className="text-black/50">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
