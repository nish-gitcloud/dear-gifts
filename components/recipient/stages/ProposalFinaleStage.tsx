"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StageShell } from "../StageShell";

/** The emotional climax (spec section 14: "the final proposal moment should be the emotional climax"). */
export function ProposalFinaleStage({ question, onContinue }: { question?: string; onContinue: () => void }) {
  const [answered, setAnswered] = useState(false);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });

  function dodgeNo() {
    setNoOffset({ x: (Math.random() - 0.5) * 160, y: (Math.random() - 0.5) * 60 });
  }

  return (
    <StageShell
      title={answered ? "She/He said YES! 💍✨" : question || "Will you marry me?"}
      onContinue={answered ? onContinue : undefined}
      hideContinue={!answered}
    >
      {!answered ? (
        <div className="relative flex flex-col items-center gap-4">
          <span className="text-7xl">💍</span>
          <div className="relative mt-4 flex gap-4">
            <motion.button
              type="button"
              onClick={() => setAnswered(true)}
              whileTap={{ scale: 0.92 }}
              className="touch-target rounded-full bg-[var(--dg-primary,#E85C7B)] px-8 py-3 font-semibold text-white shadow-lg"
            >
              Yes!
            </motion.button>
            <motion.button
              type="button"
              onMouseEnter={dodgeNo}
              onPointerDown={(e) => {
                e.preventDefault();
                dodgeNo();
              }}
              animate={{ x: noOffset.x, y: noOffset.y }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="touch-target rounded-full border border-current/20 px-8 py-3 font-semibold opacity-70"
            >
              No
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-7xl"
        >
          🎉
        </motion.span>
      )}
    </StageShell>
  );
}
