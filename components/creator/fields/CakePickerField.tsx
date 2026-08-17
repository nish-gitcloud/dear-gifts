"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./shared";

interface CakeVisual {
  sponge: string;
  icing: string;
  drip: string;
  dots: string;
  description: string;
}

/** Per-flavor illustration palette — keyed by the cake option's `value`. */
const CAKE_VISUALS: Record<string, CakeVisual> = {
  "cake-classic-pink": {
    sponge: "#FCEAE3",
    icing: "#F7A8C4",
    drip: "#F27FAE",
    dots: "#E85C7B",
    description: "Soft strawberry sponge with pink buttercream.",
  },
  "cake-chocolate": {
    sponge: "#6B4226",
    icing: "#8C5A3C",
    drip: "#4A2A16",
    dots: "#3E2412",
    description: "Rich, deep chocolate — a classic favorite.",
  },
  "cake-vanilla-cream": {
    sponge: "#FFF3D6",
    icing: "#FFFDF5",
    drip: "#F5E7B8",
    dots: "#D9C182",
    description: "Light vanilla sponge with silky cream.",
  },
  "cake-rainbow-funfetti": {
    sponge: "#FFF7EE",
    icing: "#FFFFFF",
    drip: "#FFD1E8",
    dots: "#5CD0FF",
    description: "Colorful sprinkles baked right in — pure fun.",
  },
  "cake-red-velvet": {
    sponge: "#8B1E3F",
    icing: "#FFFDF7",
    drip: "#FBEFE0",
    dots: "#C23A5A",
    description: "Velvety red sponge with cream-cheese frosting.",
  },
};

const FALLBACK_VISUAL: CakeVisual = {
  sponge: "#F7EADD",
  icing: "#FFF6E9",
  drip: "#E8C79A",
  dots: "#E85C7B",
  description: "A lovingly baked cake, just for them.",
};

/** A small illustrated tiered cake, colored per flavor — no photography needed. */
function CakeIllustration({ visual }: { visual: CakeVisual }) {
  return (
    <svg viewBox="0 0 100 84" className="h-16 w-20" aria-hidden>
      {/* plate */}
      <ellipse cx="50" cy="76" rx="42" ry="6" fill="black" opacity="0.08" />
      {/* bottom tier */}
      <rect x="14" y="46" width="72" height="26" rx="6" fill={visual.sponge} />
      <rect x="14" y="46" width="72" height="10" rx="5" fill={visual.icing} />
      {/* top tier */}
      <rect x="28" y="24" width="44" height="24" rx="6" fill={visual.sponge} />
      <rect x="28" y="24" width="44" height="9" rx="4.5" fill={visual.icing} />
      {/* drips */}
      <path
        d="M28 33 q4 8 0 12 M40 33 q4 6 0 10 M52 33 q4 8 0 12 M64 33 q4 6 0 10"
        stroke={visual.drip}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* dots / sprinkles */}
      <circle cx="34" cy="58" r="2.2" fill={visual.dots} />
      <circle cx="50" cy="62" r="2.2" fill={visual.dots} />
      <circle cx="66" cy="58" r="2.2" fill={visual.dots} />
      {/* candle */}
      <rect x="47" y="10" width="6" height="14" rx="2" fill="#F7B267" />
      <path d="M50 4 C 47 8, 47 10, 50 10 C 53 10, 53 8, 50 4 Z" fill="#FF8A3D" />
    </svg>
  );
}

/**
 * Illustrated cake picker (spec section: "Choose a Cake"). Each option shows
 * an actual tiered-cake graphic (colored per flavor) plus a one-line
 * description, instead of a plain text-label button.
 */
export function CakePickerField({ field, value, onChange }: FieldProps<string>) {
  const selected = (value as string) || "";

  return (
    <div>
      <span className="mb-3 block text-sm font-medium text-[#241A17]">
        {field.label}
        {field.required && <span className="text-[#E85C7B]"> *</span>}
      </span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {field.options?.map((opt) => {
          const isSelected = selected === opt.value;
          const visual = CAKE_VISUALS[opt.value] ?? FALLBACK_VISUAL;
          return (
            <motion.button
              key={opt.value}
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-4 text-center shadow-sm transition-colors",
                isSelected ? "border-[#E85C7B] bg-[#E85C7B]/5" : "border-black/10 hover:border-black/20"
              )}
            >
              <CakeIllustration visual={visual} />
              <span className="text-sm font-semibold text-[#241A17]">{opt.label}</span>
              <span className="text-[11px] leading-snug text-black/50">{opt.description ?? visual.description}</span>
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#E85C7B] text-xs text-white">
                  ✓
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
