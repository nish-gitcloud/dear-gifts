import type { CSSProperties } from "react";
import type { ThemeTokens } from "@/types/gift";

/**
 * Maps a ThemeTokens object to CSS custom properties. Because themes are
 * data (config/themes.ts), not static Tailwind classes, components consume
 * them via arbitrary-value utilities like `bg-[var(--dg-background)]` rather
 * than a hardcoded per-theme class list — this is what makes adding a 17th
 * theme a config-only change (spec section 49/69).
 */
export function themeCssVars(theme: ThemeTokens): CSSProperties {
  return {
    "--dg-background": theme.background,
    "--dg-surface": theme.surface,
    "--dg-primary": theme.primary,
    "--dg-secondary": theme.secondary,
    "--dg-text": theme.text,
    "--dg-accent": theme.accent,
  } as CSSProperties;
}
