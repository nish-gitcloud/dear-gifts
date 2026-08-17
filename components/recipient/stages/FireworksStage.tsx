"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StageShell } from "../StageShell";

interface Rocket {
  id: number;
  x: number;
}

/** "Fireworks" — tap to launch rockets (spec section 16). */
export function FireworksStage({ onContinue }: { onContinue: () => void }) {
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const [launches, setLaunches] = useState(0);

  function launch() {
    const id = Date.now() + Math.random();
    setRockets((r) => [...r, { id, x: 20 + Math.random() * 60 }]);
    setLaunches((n) => n + 1);
    setTimeout(() => setRockets((r) => r.filter((rk) => rk.id !== id)), 1200);
  }

  return (
    <StageShell
      title="Fireworks 🎆"
      subtitle="Tap anywhere to launch a rocket."
      onContinue={launches >= 3 ? onContinue : undefined}
      hideContinue={launches < 3}
    >
      <div className="relative h-64 w-full cursor-pointer select-none" onClick={launch}>
        <AnimatePresence>
          {rockets.map((r) => (
            <motion.span
              key={r.id}
              initial={{ y: 220, opacity: 1, scale: 0.6 }}
              animate={{ y: 0, opacity: [1, 1, 0], scale: [0.6, 1.4, 1.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute bottom-0 text-4xl"
              style={{ left: `${r.x}%` }}
            >
              🎆
            </motion.span>
          ))}
        </AnimatePresence>
        {rockets.length === 0 && (
          <div className="flex h-full items-center justify-center text-6xl opacity-30">✨</div>
        )}
      </div>
      <p className="mt-2 text-xs opacity-50">{launches}/3 launched</p>
    </StageShell>
  );
}
