"use client";

import { StageShell } from "../StageShell";
import { useHoldProgress } from "@/hooks/useHoldProgress";
import { useState } from "react";
import { motion } from "framer-motion";

/** "Blooming Flower" — hold to unfold petals (spec section 16). */
export function FlowerStage({ onContinue }: { onContinue: () => void }) {
  const [bloomed, setBloomed] = useState(false);
  const { progress, start, cancel } = useHoldProgress(1600, () => setBloomed(true));

  return (
    <StageShell
      title={bloomed ? "In full bloom 🌸" : "Blooming Flower"}
      subtitle={!bloomed ? "Hold to unfold the petals" : undefined}
      onContinue={bloomed ? onContinue : undefined}
      hideContinue={!bloomed}
    >
      <motion.button
        type="button"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        animate={{ scale: 0.7 + progress * 0.5, rotate: progress * 20 }}
        className="touch-target text-8xl"
        aria-label="Hold to unfold the petals"
      >
        {progress > 0.5 || bloomed ? "🌸" : "🌱"}
      </motion.button>
      {!bloomed && (
        <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-black/10">
          <motion.div className="h-full rounded-full bg-[var(--dg-primary,#E85C7B)]" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </StageShell>
  );
}
