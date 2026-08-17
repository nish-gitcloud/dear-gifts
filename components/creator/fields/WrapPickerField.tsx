"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GIFT_WRAPS } from "@/config/wraps";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./shared";

const CATEGORIES = [
  { id: "box", label: "Gift Box", icon: "🎁" },
  { id: "envelope", label: "Envelope", icon: "📩" },
  { id: "scroll", label: "Scroll", icon: "📜" },
  { id: "chest", label: "Chest", icon: "🗝️" },
] as const;

export interface WrapPalette {
  base: string;
  dark: string;
  accent: string;
}

/** Distinct colors per wrap option — every option gets its own illustration instead of one shared category emoji. */
export const WRAP_COLORS: Record<string, WrapPalette> = {
  "box-classic-pink": { base: "#F7A8C4", dark: "#E85C7B", accent: "#FFD966" },
  "box-royal-gold": { base: "#D4AF37", dark: "#8C6D1F", accent: "#FFF3C4" },
  "box-mint-silver": { base: "#B7E4D8", dark: "#5FA98F", accent: "#E8E8E8" },
  "box-rainbow-pop": { base: "#FF8FB3", dark: "#5CD0FF", accent: "#FFD966" },
  "envelope-classic-cream": { base: "#F3E3C2", dark: "#C9A75E", accent: "#B23B3B" },
  "envelope-rose-gold": { base: "#F3C9C9", dark: "#D98E9C", accent: "#E8B4A0" },
  "envelope-midnight-navy": { base: "#1E2A47", dark: "#0D1526", accent: "#D4AF37" },
  "scroll-classic-parchment": { base: "#E8DCC0", dark: "#B8A374", accent: "#8C6D1F" },
  "scroll-royal-navy": { base: "#26345C", dark: "#131C33", accent: "#D4AF37" },
  "scroll-rose-blush": { base: "#F3D6DE", dark: "#D98EA5", accent: "#8C5A3C" },
  "chest-classic-oak": { base: "#B8823E", dark: "#7A521F", accent: "#D4AF37" },
  "chest-dark-ebony": { base: "#3A322C", dark: "#1B1713", accent: "#C0C0C0" },
  "chest-royal-mahogany": { base: "#7A2E2E", dark: "#4A1919", accent: "#D4AF37" },
};

export const FALLBACK_WRAP_PALETTE: WrapPalette = { base: "#F7B267", dark: "#E85C7B", accent: "#FFF3C4" };

export function WrapIllustration({ category, palette }: { category: string; palette: WrapPalette }) {
  if (category === "envelope") {
    return (
      <svg viewBox="0 0 80 64" className="h-14 w-16" aria-hidden>
        <rect x="4" y="8" width="72" height="48" rx="4" fill={palette.base} />
        <path d="M4 12 L40 40 L76 12" fill="none" stroke={palette.dark} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="40" cy="40" r="6" fill={palette.accent} />
      </svg>
    );
  }
  if (category === "scroll") {
    return (
      <svg viewBox="0 0 80 64" className="h-14 w-16" aria-hidden>
        <rect x="14" y="6" width="52" height="52" rx="2" fill={palette.base} />
        <rect x="8" y="4" width="10" height="56" rx="5" fill={palette.dark} />
        <rect x="62" y="4" width="10" height="56" rx="5" fill={palette.dark} />
        <line x1="24" y1="20" x2="56" y2="20" stroke={palette.accent} strokeWidth="2" />
        <line x1="24" y1="30" x2="56" y2="30" stroke={palette.accent} strokeWidth="2" />
        <line x1="24" y1="40" x2="48" y2="40" stroke={palette.accent} strokeWidth="2" />
      </svg>
    );
  }
  if (category === "chest") {
    return (
      <svg viewBox="0 0 80 64" className="h-14 w-16" aria-hidden>
        <rect x="8" y="28" width="64" height="30" rx="4" fill={palette.base} />
        <path d="M8 28 Q40 4 72 28 L72 34 Q40 14 8 34 Z" fill={palette.dark} />
        <rect x="34" y="26" width="12" height="14" rx="3" fill={palette.accent} />
      </svg>
    );
  }
  // box (default)
  return (
    <svg viewBox="0 0 80 64" className="h-14 w-16" aria-hidden>
      <rect x="10" y="24" width="60" height="34" rx="3" fill={palette.base} />
      <rect x="10" y="24" width="60" height="10" fill={palette.dark} />
      <rect x="34" y="10" width="12" height="48" fill={palette.accent} />
      <rect x="10" y="24" width="60" height="6" fill={palette.accent} opacity="0.6" />
      <path d="M40 10 C34 2 26 2 28 10 C20 8 20 16 30 16 Z" fill={palette.accent} />
      <path d="M40 10 C46 2 54 2 52 10 C60 8 60 16 50 16 Z" fill={palette.accent} />
    </svg>
  );
}

/**
 * 3D-style wrap picker (spec section 16). Categories are presented as a
 * horizontal segmented tab control up top (not stacked section headers).
 * Every option gets its own colored illustration (not one shared emoji per
 * category), and price is intentionally not shown — the total is
 * summarized once in the sticky price bar lower on the page.
 */
export function WrapPickerField({ value, onChange }: FieldProps<string>) {
  const selected = (value as string) || "";
  const selectedWrap = GIFT_WRAPS.find((w) => w.id === selected);
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]["id"]>(
    selectedWrap?.category ?? CATEGORIES[0].id
  );

  const visible = GIFT_WRAPS.filter((w) => w.category === activeCategory);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto rounded-full bg-black/5 p-1.5">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-white text-[#241A17] shadow-sm" : "text-black/50 hover:text-black/70"
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visible.map((wrap) => {
          const isSelected = selected === wrap.id;
          const palette = WRAP_COLORS[wrap.id] ?? FALLBACK_WRAP_PALETTE;
          return (
            <motion.button
              key={wrap.id}
              type="button"
              whileHover={{ y: -3, rotate: isSelected ? 0 : -1 }}
              whileTap={{ scale: 0.95, rotate: 0 }}
              onClick={() => onChange(wrap.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-4 shadow-sm transition-colors",
                isSelected ? "border-[#E85C7B]" : "border-black/10 hover:border-black/20"
              )}
            >
              <WrapIllustration category={wrap.category} palette={palette} />
              <span className="text-xs font-semibold text-[#241A17]">{wrap.name}</span>
              {isSelected && <span className="text-[11px] font-medium text-[#E85C7B]">Selected ✓</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
