"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StageShell } from "../StageShell";

/** "Your Pledge" — the creator's promise to do better (spec section 15). */
export function PledgeStage({ pledgeText, onContinue }: { pledgeText?: string; onContinue: () => void }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <StageShell
      title="My Pledge To You"
      subtitle={pledgeText || "I promise to listen more and react less."}
      onContinue={accepted ? onContinue : undefined}
      hideContinue={!accepted}
    >
      <motion.button
        type="button"
        onClick={() => setAccepted(true)}
        whileTap={{ scale: 0.9 }}
        className="touch-target text-6xl"
        aria-label="Tap to accept"
      >
        {accepted ? "🤝" : "✋"}
      </motion.button>
      {!accepted && <p className="mt-4 text-xs opacity-50">Tap to accept</p>}
    </StageShell>
  );
}
