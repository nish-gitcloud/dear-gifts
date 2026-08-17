"use client";

import { AnimatePresence, motion } from "framer-motion";

interface CakeVisual {
  sponge: string;
  icing: string;
  drip: string;
}

const CAKE_VISUALS: Record<string, CakeVisual> = {
  "cake-classic-pink": { sponge: "#FCEAE3", icing: "#F7A8C4", drip: "#F27FAE" },
  "cake-chocolate": { sponge: "#6B4226", icing: "#8C5A3C", drip: "#4A2A16" },
  "cake-vanilla-cream": { sponge: "#FFF3D6", icing: "#FFFDF5", drip: "#F5E7B8" },
  "cake-rainbow-funfetti": { sponge: "#FFF7EE", icing: "#FFFFFF", drip: "#FFD1E8" },
  "cake-red-velvet": { sponge: "#8B1E3F", icing: "#FFFDF7", drip: "#FBEFE0" },
};
const FALLBACK_VISUAL: CakeVisual = { sponge: "#F7EADD", icing: "#FFF6E9", drip: "#E8C79A" };

const WAX_COLORS = ["#F7B267", "#F2637F", "#5CD0FF", "#8CD790", "#C79CF2"];

// A real flame never holds still — the previous version only nudged the
// flame through one keyframe pass on mount (no `repeat`), so after that
// first blink it just sat there static, which is a big part of why the
// candles read as "not really candles." This loops for as long as the
// flame is lit, and gets its own quick, distinct transition for the
// blow-out itself (an `exit` transition would otherwise inherit `repeat`
// from the loop and never actually finish shrinking away).
const flameVariants = {
  lit: {
    scaleY: [1, 1.18, 0.9, 1.1, 1],
    scaleX: [1, 0.88, 1.06, 0.95, 1],
    rotate: [-3, 3, -2, 2, 0],
    transition: { duration: 1.3, repeat: Infinity, ease: "easeInOut" as const },
  },
  blown: { opacity: 0, y: -12, scale: 0.3, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/** A small two-tone teardrop flame (real shape, not the 🔥 emoji) with a soft warm glow behind it — reads as an actual candle flame instead of a generic icon. */
function Flame({ id }: { id: string }) {
  return (
    <motion.div
      variants={flameVariants}
      initial="lit"
      animate="lit"
      exit="blown"
      style={{ transformOrigin: "50% 100%" }}
      className="relative flex items-end justify-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-md"
        style={{ background: "radial-gradient(circle, rgba(255,175,60,0.9) 0%, transparent 72%)" }}
      />
      <svg width="12" height="20" viewBox="0 0 12 20" className="relative">
        <defs>
          <linearGradient id={`flameOuter-${id}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#FF7A1A" />
            <stop offset="55%" stopColor="#FFB23E" />
            <stop offset="100%" stopColor="#FFEEB0" />
          </linearGradient>
          <linearGradient id={`flameInner-${id}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#FF9A3E" />
            <stop offset="100%" stopColor="#FFF7DE" />
          </linearGradient>
        </defs>
        <path d="M6 20 C1.5 13.5 2.5 8 6 0 C9.5 8 10.5 13.5 6 20 Z" fill={`url(#flameOuter-${id})`} />
        <path d="M6 16.5 C3.8 11.8 4.3 8.5 6 3.8 C7.7 8.5 8.2 11.8 6 16.5 Z" fill={`url(#flameInner-${id})`} />
      </svg>
    </motion.div>
  );
}

/**
 * An illustrated tiered cake (reusing the same palette-per-flavor idea as
 * the creator-side CakePickerField) with real candle sticks + flickering
 * flames on top — each flame extinguishes with its own little
 * flame-shrink + rising-smoke animation instead of a flat cake emoji with a
 * baked-in candle graphic that can never visually "go out."
 */
export function CakeCandles({
  cakeId,
  litCount,
  total,
  onTap,
}: {
  cakeId?: string;
  litCount: number;
  total: number;
  onTap: () => void;
}) {
  const visual = CAKE_VISUALS[cakeId ?? ""] ?? FALLBACK_VISUAL;
  // Spread across roughly 27%–73% of the button's width — the illustrated
  // cake's top tier (drawn below) only spans x:45–135 of its 180-wide
  // viewBox, i.e. 25%–75%. Keeping candles inside that range means they all
  // visually sit ON the tier instead of a couple hanging off its edges.
  const positions = Array.from({ length: total }, (_, i) => 27 + i * (46 / Math.max(1, total - 1)));

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label="Tap to blow out the candles"
      className="touch-target relative mx-auto block"
      style={{ width: 180, height: 150 }}
    >
      {/* The cake must be painted BEFORE the candles in the DOM — later
          siblings paint over earlier ones, so with this order first, the
          candles (painted after/below) correctly sit on TOP of the cake
          instead of being hidden behind it. */}
      <svg viewBox="0 0 180 130" className="absolute bottom-0 left-0 h-[130px] w-[180px]" aria-hidden>
        <ellipse cx="90" cy="122" rx="80" ry="8" fill="black" opacity="0.12" />
        <rect x="20" y="70" width="140" height="50" rx="10" fill={visual.sponge} />
        <rect x="20" y="70" width="140" height="16" rx="8" fill={visual.icing} />
        <rect x="45" y="35" width="90" height="42" rx="10" fill={visual.sponge} />
        <rect x="45" y="35" width="90" height="14" rx="7" fill={visual.icing} />
        <path
          d="M45 48 q8 14 0 20 M65 48 q8 10 0 18 M90 48 q8 14 0 20 M115 48 q8 10 0 18 M135 48 q8 14 0 20"
          stroke={visual.drip}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
      </svg>

      {positions.map((leftPct, i) => {
        const lit = i < litCount;
        const waxColor = WAX_COLORS[i % WAX_COLORS.length];
        return (
          // bottom-[95px]: the top tier's icing surface sits at y=55 (from
          // the button's top edge) in this 150px-tall button — matching the
          // candle stick's bottom to that exact line is what makes candles
          // read as rising OUT of the icing instead of sinking partway into
          // the tier (the previous 74px value put their base ~20px below
          // the icing surface, buried inside the cake body).
          <div
            key={i}
            className="absolute bottom-[95px] flex flex-col items-center"
            style={{ left: `${leftPct}%`, transform: "translateX(-50%)" }}
          >
            {/* Fixed-height flame slot so every wick lines up at the same
                height whether its flame is a tall teardrop or a small
                rising-smoke puff. */}
            <div className="flex h-6 w-4 items-end justify-center">
              <AnimatePresence>
                {lit ? (
                  <Flame key="flame" id={String(i)} />
                ) : (
                  <motion.span
                    key="smoke"
                    initial={{ opacity: 0.55, y: 0 }}
                    animate={{ opacity: 0, y: -18 }}
                    transition={{ duration: 1.1 }}
                    className="pointer-events-none text-xs opacity-40"
                  >
                    💨
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {/* wick — stays visible even once blown out, like a real candle */}
            <div className="h-1.5 w-[2px] rounded-full bg-[#3B2E27]" />
            {/* wax stick — a vertical highlight/shadow stripe gives it a
                rounded, glossy candle look instead of a flat colored bar */}
            <div
              className="h-5 w-[7px] rounded-t-[2px]"
              style={{
                background: waxColor,
                boxShadow: "inset 1.5px 0 0 rgba(255,255,255,0.55), inset -1.5px 0 0 rgba(0,0,0,0.2)",
              }}
            />
          </div>
        );
      })}
    </button>
  );
}
