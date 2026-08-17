"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StageShell } from "../StageShell";

/**
 * A hand-drawn jar (glass body, wooden lid, folded paper slips inside)
 * instead of the 🫙 emoji — that glyph is recent enough (Unicode 14, 2021)
 * that plenty of Windows/Chrome installs still render it as an empty tofu
 * box, which is exactly the "jar image not showing" report. A custom SVG
 * renders identically everywhere, no font/emoji-set dependency at all.
 */
function JarIllustration() {
  return (
    <svg width="84" height="100" viewBox="0 0 84 100" aria-hidden>
      <defs>
        <linearGradient id="jorJarGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EAF6FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#BFE3F5" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {/* lid */}
      <rect x="26" y="2" width="32" height="9" rx="3" fill="#D9A465" />
      <rect x="22" y="9" width="40" height="8" rx="3" fill="#C68A4E" />
      {/* neck */}
      <path d="M28 17 L56 17 L52 27 L32 27 Z" fill="url(#jorJarGlass)" stroke="#9FD3EC" strokeWidth="1.5" />
      {/* body */}
      <path
        d="M18 27 H66 C68 27 69 29 69 31 V84 C69 93 60 97 42 97 C24 97 15 93 15 84 V31 C15 29 16 27 18 27 Z"
        fill="url(#jorJarGlass)"
        stroke="#9FD3EC"
        strokeWidth="2"
      />
      {/* glass shine */}
      <path d="M24 36 C22 53 22 73 26 88" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5" fill="none" />
      {/* folded paper "reasons" tucked inside */}
      <rect x="32" y="52" width="20" height="12" rx="2" fill="#FFF7E8" stroke="#E8C79A" transform="rotate(-8 42 58)" />
      <rect x="28" y="68" width="18" height="11" rx="2" fill="#FDEBF1" stroke="#F2B6CC" transform="rotate(6 37 73)" />
      <rect x="40" y="42" width="16" height="10" rx="2" fill="#EAF3FF" stroke="#B9D6F2" transform="rotate(-3 48 47)" />
    </svg>
  );
}

/** "A Jar of Reasons" — tap the jar to draw reasons one at a time (spec section 14). */
export function JarOfReasonsStage({ reasons, onContinue }: { reasons?: string[]; onContinue: () => void }) {
  const list = (reasons ?? []).filter(Boolean).length ? reasons!.filter(Boolean) : ["The way you make ordinary days feel golden."];
  const [drawn, setDrawn] = useState<number[]>([]);
  const allDrawn = drawn.length >= list.length;

  function draw() {
    const remaining = list.map((_, i) => i).filter((i) => !drawn.includes(i));
    if (!remaining.length) return;
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    setDrawn((d) => [...d, next]);
  }

  return (
    <StageShell
      title="A Jar of Reasons"
      subtitle="Tap the jar to draw a reason."
      onContinue={allDrawn ? onContinue : undefined}
      hideContinue={!allDrawn}
    >
      <motion.button
        type="button"
        onClick={draw}
        whileTap={{ scale: 0.92 }}
        className="touch-target"
        aria-label="Tap the jar to draw a reason"
      >
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
          <JarIllustration />
        </motion.div>
      </motion.button>
      <p className="mt-2 text-xs opacity-50">
        {drawn.length}/{list.length} reasons drawn
      </p>
      <div className="mt-4 space-y-2">
        <AnimatePresence>
          {drawn.map((i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white/70 px-3 py-2 text-sm shadow-sm"
            >
              {list[i]}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </StageShell>
  );
}
