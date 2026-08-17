"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const CONFETTI_COLORS = ["#E85C7B", "#F7B267", "#5CD0FF", "#FFC93C", "#B993FF", "#2ED9A3"];
const HEART_GLYPHS = ["💖", "💕", "💗", "❤️", "💞"];

interface Piece {
  id: number;
  originLeft: number;
  originTop: number;
  angle: number;
  distance: number;
  isHeart: boolean;
  glyph: string;
  color: string;
  size: number;
  delay: number;
  spin: number;
}

/**
 * A one-shot celebration burst — confetti squares mixed with heart emojis,
 * bursting outward from many points spread across the *entire* screen and
 * tumbling down, like several poppers going off at once across the page.
 * Mount this conditionally (e.g. `{done && <PartyPopperBurst />}`) at the
 * moment something completes; it plays once and doesn't loop.
 *
 * Deliberately `fixed` (not `absolute`) so it always covers the full
 * viewport regardless of how small or oddly-shaped the caller's own wrapper
 * is — e.g. a cake button or a row of balloons is much smaller than the
 * screen, and an `absolute` burst confined to that wrapper's box got
 * clipped by its own `overflow-hidden` before it ever reached full size.
 */
export function PartyPopperBurst({ count = 40 }: { count?: number }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const isHeart = i % 3 !== 0; // mostly hearts — this is a "love emoji burst"
        return {
          id: i,
          // Golden-ratio spread again, so origins land evenly across the
          // whole viewport instead of clumping — see ParticleField for why.
          originLeft: (i * 61.8) % 100,
          originTop: 6 + ((i * 41.4) % 60),
          angle: (i / count) * Math.PI * 2 + (i % 2) * 0.3,
          distance: 50 + ((i * 37) % 110),
          isHeart,
          glyph: HEART_GLYPHS[i % HEART_GLYPHS.length],
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          size: isHeart ? 18 + (i % 3) * 6 : 6 + (i % 4) * 2,
          delay: (i % 10) * 0.04,
          spin: (i % 2 === 0 ? 1 : -1) * (180 + (i % 4) * 90),
        };
      }),
    [count]
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.3 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance * 0.7 + 70,
            opacity: 0,
            rotate: p.spin,
            scale: 1,
          }}
          transition={{ duration: 1.8, delay: p.delay, ease: "easeOut" }}
          className="absolute select-none"
          style={{
            left: `${p.originLeft}%`,
            top: `${p.originTop}%`,
            ...(p.isHeart
              ? { fontSize: p.size }
              : {
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: 2,
                }),
          }}
        >
          {p.isHeart ? p.glyph : null}
        </motion.span>
      ))}
    </div>
  );
}
