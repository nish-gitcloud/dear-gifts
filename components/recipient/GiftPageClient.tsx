"use client";

import type { OccasionDefinition } from "@/types/gift";
import { RecipientExperience } from "./RecipientExperience";

export function GiftPageClient({
  token,
  occasion,
  values,
  sessionId,
}: {
  token: string;
  occasion: OccasionDefinition;
  values: Record<string, Record<string, unknown>>;
  /** Minted server-side per page load (app/gift/[token]/page.tsx) — see RecipientExperience for how it threads through the rest of the recipient funnel. */
  sessionId: string;
}) {
  async function onVerifyPin(pin: string) {
    const res = await fetch(`/api/gifts/${token}/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    return res.json();
  }

  return (
    <RecipientExperience
      occasion={occasion}
      values={values}
      onVerifyPin={onVerifyPin}
      giftToken={token}
      sessionId={sessionId}
    />
  );
}
