"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ThemeTokens } from "@/types/gift";

const GLYPHS: Record<ThemeTokens["particleStyle"], string> = {
  none: "",
  stars: "✦",
  hearts: "♥",
  confetti: "●",
  snow: "❄",
  sparkle: "✧",
  petals: "❀",
};

interface Particle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
}

/**
 * Full-screen ambient background particles — many of them, spread across
 * the entire width, drifting continuously from top to bottom (like real
 * falling snow/confetti/petals) across the *whole* themed container, not
 * clumped near the top. Purely decorative, so it fully disables itself
 * under prefers-reduced-motion (spec section 52). Positions are derived
 * deterministically from `count`/index (no Math.random()) so this renders
 * identically on server and client — no mount-gating needed to avoid a
 * hydration mismatch.
 *
 * Important: the fall distance is animated via the `top` style (a
 * percentage of this positioned container's height), not a `y` transform.
 * Framer Motion resolves percentage `y`/transform values against the
 * element's OWN size, not its parent's — animating a ~20px-tall glyph from
 * y:-10% to y:110% only ever moves it by a couple of pixels, which is what
 * made every theme's particles look stuck near the top. `top`/`left`
 * percentages are resolved against the containing block instead, so this
 * actually travels the full height of the page.
 */
export function ParticleField({ style, color, count = 36 }: { style: ThemeTokens["particleStyle"]; color: string; count?: number }) {
  const reduceMotion = useReducedMotion();

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        // A pseudo-random but fully deterministic spread across 0–100% —
        // an irrational-ish multiplier (61.8, the golden-ratio conjugate
        // scaled) avoids the small repeating cycles a plain `%100` step can
        // fall into once count grows, so particles land close to evenly
        // spread across the *entire* width instead of clustering.
        left: (i * 61.8) % 100,
        size: 10 + ((i * 37) % 18),
        delay: (i % 12) * 1.1,
        duration: 9 + (i % 8) * 1.5,
        drift: ((i % 5) - 2) * 10, // small side-to-side sway, in px
        spin: i % 2 === 0 ? 220 : -220, // tumble direction, for a pseudo-3D roll as it falls
      })),
    [count]
  );

  if (style === "none" || reduceMotion) return null;
  const glyph = GLYPHS[style];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 h-full min-h-full overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ top: "-8%", opacity: 0, x: 0, rotate: 0, scale: 0.7 }}
          animate={{
            top: "112%",
            opacity: [0, 0.9, 0.9, 0],
            x: [0, p.drift, 0, -p.drift, 0],
            rotate: [0, p.spin],
            scale: [0.7, 1.15, 0.85, 1],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
          style={{ left: `${p.left}%`, fontSize: p.size, color, filter: `drop-shadow(0 2px 3px rgba(0,0,0,0.25))` }}
          className="absolute select-none"
        >
          {glyph}
        </motion.span>
      ))}
    </div>
  );
}
