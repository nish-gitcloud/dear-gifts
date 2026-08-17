"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StageShell } from "../StageShell";

/** "Trophy" — tap to raise (spec section 16, also used for Congratulations). */
export function TrophyStage({ onContinue }: { onContinue: () => void }) {
  const [raised, setRaised] = useState(false);

  return (
    <StageShell title="You Did It! 🏆" onContinue={onContinue}>
      <motion.button
        type="button"
        onClick={() => setRaised(true)}
        whileTap={{ scale: 0.9 }}
        animate={raised ? { y: -30, scale: 1.2 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="touch-target text-8xl"
        aria-label="Tap to raise the trophy"
      >
        🏆
      </motion.button>
      {!raised && <p className="mt-6 text-xs opacity-50">Tap to raise it high</p>}
    </StageShell>
  );
}
