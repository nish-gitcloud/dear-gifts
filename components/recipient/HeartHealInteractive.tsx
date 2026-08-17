"use client";

import { motion } from "framer-motion";
import { useHoldProgress } from "@/hooks/useHoldProgress";

/**
 * Shared "hold to mend a cracked heart" interaction (spec sections 15 & 16
 * — used by Apology's Broken Heart stage and Custom Wishes' Heart Heal
 * celebration element). The heart visually shifts from broken to whole as
 * hold progress increases, rather than snapping at 100%.
 */
export function HeartHealInteractive({ onHealed, label = "Hold to help it heal" }: { onHealed: () => void; label?: string }) {
  const { progress, start, cancel, done } = useHoldProgress(1800, onHealed);

  return (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        className="touch-target relative text-8xl"
        aria-label={label}
      >
        <span style={{ opacity: 1 - progress }}>💔</span>
        <span className="absolute inset-0" style={{ opacity: progress }}>
          ❤️
        </span>
      </motion.button>
      {!done && (
        <>
          <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-black/10">
            <motion.div className="h-full rounded-full bg-[var(--dg-primary,#E85C7B)]" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="mt-3 text-xs opacity-50">{label}</p>
        </>
      )}
    </div>
  );
}
