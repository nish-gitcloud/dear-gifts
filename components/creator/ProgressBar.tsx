"use client";

import { motion } from "framer-motion";

/**
 * "Step X of N" progress (spec sections 11 & 70). Step labels scroll
 * horizontally on mobile instead of wrapping into a wall of text, so the
 * creator never feels shown "50 fields at once".
 */
export function ProgressBar({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  const total = steps.length;
  const percent = ((currentIndex + 1) / total) * 100;

  return (
    <div className="border-b border-black/5 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl px-4 pt-3">
        <div className="flex items-center justify-between text-xs text-black/50">
          <span>
            Step {currentIndex + 1} of {total}
          </span>
          <span className="font-medium text-[#E85C7B]">{steps[currentIndex]}</span>
        </div>
        <div className="mt-2 mb-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
          <motion.div
            className="h-full rounded-full bg-[#E85C7B]"
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
