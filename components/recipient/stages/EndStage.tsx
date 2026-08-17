"use client";

import { StageShell } from "../StageShell";
import { PartyPopperBurst } from "../PartyPopperBurst";

/** Closing screen with "Watch Again" (spec sections 44 & 73) — the grand finale gets its own full-page love-emoji burst. */
export function EndStage({ recipientName, onWatchAgain }: { recipientName?: string; onWatchAgain: () => void }) {
  return (
    <>
      <PartyPopperBurst />
      <StageShell
        title="That's everything I wanted you to see."
        subtitle={`Made especially for ${recipientName || "you"}. Made with love on Dear Gifts.`}
        onContinue={onWatchAgain}
        continueLabel="Watch Again"
      />
    </>
  );
}
