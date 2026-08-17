"use client";

import { motion } from "framer-motion";
import { THEMES } from "@/config/themes";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./shared";

/**
 * Emoji/icon-led theme picker (spec section 15/67). Each card leads with the
 * theme's icon + a one-line mood description instead of a raw color/gradient
 * swatch — picking a theme should feel like picking a whole mood, not a
 * paint color. No price is shown here; the total price is summarized once,
 * lower down, in the sticky price bar.
 */
export function ThemePickerField({ value, onChange }: FieldProps<string>) {
  const selected = (value as string) || "";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {THEMES.map((theme) => {
        const isSelected = selected === theme.id;
        return (
          <motion.button
            key={theme.id}
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(theme.id)}
            className={cn(
              "group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border-2 px-3 py-5 text-center shadow-sm transition-colors",
              isSelected ? "border-[#E85C7B]" : "border-transparent hover:border-black/10"
            )}
            style={{ background: theme.background }}
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-inner"
              style={{ background: theme.surface, boxShadow: `0 0 0 1px ${theme.primary}33 inset` }}
            >
              {theme.emoji}
            </span>
            <p className="text-sm font-semibold" style={{ color: theme.text }}>
              {theme.name}
            </p>
            <p className="text-[11px] leading-snug opacity-70" style={{ color: theme.text }}>
              {theme.moodDescription}
            </p>
            {isSelected && (
              <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#E85C7B] text-xs text-white shadow">
                ✓
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
