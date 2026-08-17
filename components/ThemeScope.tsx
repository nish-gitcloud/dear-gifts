"use client";

import { type ReactNode } from "react";
import { getTheme } from "@/config/themes";
import { themeCssVars } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ParticleField } from "@/components/recipient/ParticleField";

/**
 * Wraps a subtree in a given theme's CSS custom properties + particle
 * background + font pairing. Used to scope the recipient experience (and
 * live creator previews) to whichever theme was selected — themes change
 * background, surface, typography, and motion together, never a single
 * color (spec section 15/49).
 */
export function ThemeScope({
  themeId,
  className,
  showParticles = true,
  children,
}: {
  themeId: string;
  className?: string;
  showParticles?: boolean;
  children: ReactNode;
}) {
  const theme = getTheme(themeId);

  return (
    <div
      data-theme={theme.id}
      data-animation={theme.animationStyle}
      style={themeCssVars(theme)}
      className={cn(
        "relative isolate bg-[var(--dg-background)] text-[var(--dg-text)] transition-colors duration-700",
        className
      )}
    >
      {showParticles && theme.particleStyle !== "none" && (
        <ParticleField style={theme.particleStyle} color={theme.accent} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
