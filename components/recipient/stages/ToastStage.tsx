"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StageShell } from "../StageShell";

const TOAST_COPY: Record<string, { emoji: string; label: string; note: string }> = {
  champagne: { emoji: "🥂", label: "Champagne", note: "The original golden champagne clink." },
  rose: { emoji: "🍷", label: "Rosé", note: "A soft pink rosé toast." },
  "red-wine": { emoji: "🍷", label: "Red Wine", note: "A deep, romantic red wine clink." },
  "sparkling-blue": { emoji: "🍾", label: "Sparkling Blue", note: "" },
};

/** "Choose a Toast" recipient moment (spec section 13 anniversary flow). Tap to clink. */
export function ToastStage({ toastId, onContinue }: { toastId?: string; onContinue: () => void }) {
  const [clinked, setClinked] = useState(false);
  const toast = TOAST_COPY[toastId ?? "champagne"] ?? TOAST_COPY.champagne;

  return (
    <StageShell
      title={clinked ? "Cheers to us 🥂" : "Raise a Toast"}
      subtitle={!clinked ? toast.note : undefined}
      onContinue={clinked ? onContinue : undefined}
      hideContinue={!clinked}
    >
      <motion.button
        type="button"
        onClick={() => setClinked(true)}
        whileTap={{ scale: 0.9, rotate: -8 }}
        animate={clinked ? { rotate: [0, -15, 10, 0], scale: [1, 1.15, 1] } : { y: [0, -4, 0] }}
        transition={clinked ? { duration: 0.6 } : { duration: 2, repeat: Infinity }}
        className="touch-target text-8xl"
        aria-label="Tap to clink glasses"
      >
        {toast.emoji}
      </motion.button>
      {!clinked && <p className="mt-4 text-xs opacity-50">Tap to clink glasses</p>}
    </StageShell>
  );
}
