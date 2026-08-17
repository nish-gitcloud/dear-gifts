"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

/**
 * Every recipient stage occupies the full screen (spec section 2: "Do NOT
 * create one long boring page"). This shell standardizes that full-screen,
 * centered, cinematically-transitioned layout and the "Continue" affordance
 * shared by nearly every stage.
 */
export function StageShell({
  title,
  subtitle,
  children,
  onContinue,
  continueLabel = "Continue ✨",
  hideContinue = false,
}: {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  onContinue?: () => void;
  continueLabel?: string;
  hideContinue?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-16 text-center"
    >
      {title && (
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          // A colorful gradient (the theme's primary → accent) instead of
          // the same flat foreground color the subtitle uses below — title
          // and subtitle used to differ only in size, which read as "the
          // same text twice," not a highlighted heading over a caption.
          className="font-display bg-gradient-to-r from-[var(--dg-primary)] to-[var(--dg-accent)] bg-clip-text text-2xl font-extrabold text-transparent sm:text-4xl"
        >
          {title}
        </motion.h1>
      )}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          // Deliberately the opposite treatment from the title on every
          // axis that was asked for: body font (not display), italic (not
          // upright), medium weight (not extrabold), and the theme's
          // secondary color (not a gradient) — so the two are unmistakably
          // different roles, not the same style at two sizes.
          className="mt-3 max-w-md text-sm font-medium italic text-[var(--dg-secondary)] opacity-90 sm:text-base"
        >
          {subtitle}
        </motion.p>
      )}

      <div className="mt-8 w-full max-w-md">{children}</div>

      {!hideContinue && onContinue && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10"
        >
          <Button onClick={onContinue}>{continueLabel}</Button>
        </motion.div>
      )}
    </motion.section>
  );
}
