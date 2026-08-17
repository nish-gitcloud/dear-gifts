"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StageShell } from "../StageShell";
import { PartyPopperBurst } from "../PartyPopperBurst";
import { BalloonPop } from "../BalloonPop";

/** "Pop the Wishes" balloon interaction (spec section 22/42). */
export function WishesStage({ wishes, onContinue }: { wishes: string[]; onContinue: () => void }) {
  const list = wishes.filter(Boolean).length ? wishes.filter(Boolean) : ["Wishing you all the happiness in the world."];
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const allPopped = popped.size >= list.length;

  return (
    <StageShell
      title="Pop the Wishes 🎈"
      subtitle="Tap each balloon to reveal a little wish."
      onContinue={allPopped ? onContinue : undefined}
      hideContinue={!allPopped}
    >
      <div className="mb-6 flex justify-center">
        <span className="rounded-full border border-current/15 bg-black/5 px-4 py-1.5 text-xs font-semibold">
          Popped {popped.size}/{list.length}
        </span>
      </div>

      <div className="relative flex flex-wrap justify-center gap-4">
        {allPopped && <PartyPopperBurst />}
        {list.map((wish, i) => (
          <div key={i} className="flex w-24 flex-col items-center">
            <BalloonPop index={i} popped={popped.has(i)} onPop={() => setPopped((prev) => new Set(prev).add(i))} />
            {popped.has(i) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="-mt-2 rounded-xl bg-white/90 p-2 text-[11px] leading-snug text-black shadow"
              >
                {wish}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </StageShell>
  );
}
