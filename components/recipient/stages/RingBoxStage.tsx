"use client";

import { motion } from "framer-motion";
import { StageShell } from "../StageShell";
import { useHoldProgress } from "@/hooks/useHoldProgress";
import { useState } from "react";

/**
 * Press-and-hold ring box (spec section 14/28). Deliberately slow and
 * effortful — this is the emotional climax, so opening it should feel
 * earned, not a casual tap.
 */
export function RingBoxStage({ onContinue }: { onContinue: () => void }) {
  const [opened, setOpened] = useState(false);
  const { progress, start, cancel } = useHoldProgress(1400, () => setOpened(true));

  return (
    <StageShell
      title={opened ? "💍" : "One more step..."}
      subtitle={!opened ? "Press and hold to open" : undefined}
      onContinue={opened ? onContinue : undefined}
      hideContinue={!opened}
      continueLabel="I'm ready"
    >
      <div className="flex flex-col items-center">
        <motion.button
          type="button"
          onPointerDown={start}
          onPointerUp={cancel}
          onPointerLeave={cancel}
          animate={opened ? { scale: [1, 1.3, 1.1], rotate: [0, -10, 0] } : {}}
          className="touch-target relative text-8xl"
          aria-label="Press and hold to open the ring box"
        >
          {opened ? "💍" : "🎁"}
        </motion.button>
        {!opened && (
          <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-black/10">
            <motion.div
              className="h-full rounded-full bg-[var(--dg-primary,#E85C7B)]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>
    </StageShell>
  );
}
