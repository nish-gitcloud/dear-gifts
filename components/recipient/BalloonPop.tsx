"use client";

import { AnimatePresence, motion } from "framer-motion";

const BALLOON_COLORS = ["#FF6B6B", "#4D96FF", "#FFD93D", "#6BCB77", "#C780FA", "#FF9AC1"];

/**
 * A real illustrated latex balloon (gradient sheen + knot + string) instead
 * of a flat emoji with a hue-rotate filter, plus an actual "pop" — a burst
 * of colored shards and a flash — rather than just fading the emoji out.
 */
export function BalloonPop({
  index,
  popped,
  onPop,
}: {
  index: number;
  popped: boolean;
  onPop: () => void;
}) {
  const color = BALLOON_COLORS[index % BALLOON_COLORS.length];
  const sway = 2.2 + (index % 3) * 0.5;

  return (
    <div className="relative flex h-28 w-20 items-start justify-center">
      <AnimatePresence>
        {!popped && (
          <motion.button
            type="button"
            key="balloon"
            initial={{ y: 0, rotate: 0 }}
            animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
            exit={{ scale: 1.4, opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: sway, repeat: Infinity, ease: "easeInOut" }}
            whileTap={{ scale: 0.9 }}
            onClick={onPop}
            aria-label={`Pop balloon ${index + 1}`}
            className="touch-target absolute inset-0 flex flex-col items-center"
          >
            <svg viewBox="0 0 60 76" className="h-24 w-20 drop-shadow-lg">
              <defs>
                <radialGradient id={`balloon-grad-${index}`} cx="35%" cy="28%" r="70%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="35%" stopColor={color} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={color} />
                </radialGradient>
              </defs>
              <path
                d="M30 2 C10 2 2 22 2 36 C2 54 15 68 30 68 C45 68 58 54 58 36 C58 22 50 2 30 2 Z"
                fill={`url(#balloon-grad-${index})`}
              />
              <ellipse cx="20" cy="18" rx="6" ry="9" fill="white" opacity="0.5" />
              <path d="M27 66 L24 72 L30 70 L36 72 L33 66 Z" fill={color} />
            </svg>
            <svg viewBox="0 0 20 40" className="-mt-1 h-10 w-5" aria-hidden>
              <path d="M10 0 Q16 16 6 24 Q -2 32 10 40" stroke="rgba(0,0,0,0.28)" strokeWidth="1.3" fill="none" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {popped && (
          <motion.div key="burst" className="pointer-events-none absolute inset-x-0 top-10">
            {Array.from({ length: 10 }).map((_, j) => {
              const angle = (j / 10) * Math.PI * 2;
              return (
                <motion.span
                  key={j}
                  className="absolute left-1/2 top-0 block h-2 w-2 rounded-full"
                  style={{ background: color }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(angle) * 36, y: Math.sin(angle) * 36 - 10, opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              );
            })}
            <motion.span
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-3xl"
            >
              💥
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
