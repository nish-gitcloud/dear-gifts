"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StageShell } from "../StageShell";

/** "Renew a Promise" — tap a wax seal to renew the vow (spec section 13). */
export function PromiseStage({ promiseText, onContinue }: { promiseText?: string; onContinue: () => void }) {
  const [sealed, setSealed] = useState(false);

  return (
    <StageShell
      title={sealed ? "Promise renewed 💫" : "Renew a Promise"}
      subtitle={promiseText || "I promise to keep choosing you, every single day."}
      onContinue={sealed ? onContinue : undefined}
      hideContinue={!sealed}
    >
      <motion.button
        type="button"
        onClick={() => setSealed(true)}
        whileTap={{ scale: 0.85 }}
        animate={sealed ? { scale: [1, 1.3, 1], rotate: [0, 15, 0] } : { scale: [1, 1.05, 1] }}
        transition={{ duration: sealed ? 0.6 : 1.8, repeat: sealed ? 0 : Infinity }}
        className="touch-target text-7xl"
        aria-label="Tap to seal the promise"
      >
        {sealed ? "💫" : "🕯️"}
      </motion.button>
      {!sealed && <p className="mt-4 text-xs opacity-50">Tap to seal the promise</p>}
    </StageShell>
  );
}
