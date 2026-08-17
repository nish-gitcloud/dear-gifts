"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StageShell } from "../StageShell";
import { PartyPopperBurst } from "../PartyPopperBurst";
import { SlidingPuzzle } from "../games/SlidingPuzzle";
import { MemoryMatch } from "../games/MemoryMatch";

/** Renders whichever mini-game was chosen (spec sections 21, 40, 41). */
export function GameStage({
  gameId,
  puzzleImage,
  onContinue,
}: {
  gameId?: string;
  puzzleImage?: string;
  onContinue: () => void;
}) {
  const [solved, setSolved] = useState(false);

  return (
    <StageShell title="One Little Challenge 🧩" onContinue={solved ? onContinue : undefined} hideContinue={!solved}>
      {gameId === "memory-match" ? (
        <MemoryMatch onSolved={() => setSolved(true)} />
      ) : (
        <SlidingPuzzle image={puzzleImage} onSolved={() => setSolved(true)} />
      )}

      {/* Shown right below the game itself once solved — no separate page/stage. */}
      <AnimatePresence>
        {solved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-6 flex flex-col items-center gap-1"
          >
            <PartyPopperBurst />
            <span className="text-4xl">🎉</span>
            <p className="font-display text-lg font-semibold">
              {gameId === "memory-match" ? "Memory unlocked 💕" : "You did it!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </StageShell>
  );
}
