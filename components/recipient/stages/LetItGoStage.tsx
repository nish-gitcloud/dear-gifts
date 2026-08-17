"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StageShell } from "../StageShell";

/** "Let It Go" — an emotional release interaction before moving forward (spec section 15). */
export function LetItGoStage({ onContinue }: { onContinue: () => void }) {
  const [released, setReleased] = useState(false);

  return (
    <StageShell
      title={released ? "Let it go. Let's move forward, together." : "Let It Go"}
      subtitle={!released ? "Tap the lantern to release it." : undefined}
      onContinue={released ? onContinue : undefined}
      hideContinue={!released}
    >
      <AnimatePresence mode="wait">
        {!released ? (
          <motion.button
            key="lantern"
            type="button"
            onClick={() => setReleased(true)}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="touch-target text-7xl"
            aria-label="Tap the lantern to release it"
          >
            🏮
          </motion.button>
        ) : (
          <motion.span
            key="released"
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -220, opacity: 0, scale: 0.6 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="inline-block text-7xl"
          >
            🏮
          </motion.span>
        )}
      </AnimatePresence>
    </StageShell>
  );
}
