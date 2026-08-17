"use client";

import { StageShell } from "../StageShell";

/**
 * Slow anticipation-building beat right before the ring box (spec section
 * 14: "gradually build anticipation... do NOT immediately reveal the
 * proposal"). Deliberately quiet — no interaction, just a breath before the
 * climax.
 */
export function BuildUpStage({ onContinue }: { onContinue: () => void }) {
  return (
    <StageShell
      title="There's something I need to tell you..."
      subtitle="I've been waiting for the right moment. I think this is it."
      onContinue={onContinue}
      continueLabel="I'm listening ✨"
    >
      <span className="text-6xl">✨</span>
    </StageShell>
  );
}
