"use client";

import { motion } from "framer-motion";
import { StageShell } from "../StageShell";

const GIFT_COPY: Record<string, { emoji: string; label: string; note: string }> = {
  "sorry-cat": { emoji: "🐱", label: "A cute crying cat", note: "...to melt their heart." },
  "teddy-bear": { emoji: "🧸", label: "A teddy bear", note: "A soft, comforting hug in a box." },
  "flower-bouquet": { emoji: "💐", label: "A flower bouquet", note: "A beautiful arrangement, just for you." },
  "gourmet-chocolates": { emoji: "🍫", label: "Gourmet chocolates", note: "Sweet treats to make things right." },
};

/** "The Apology Gift" reveal (spec section 15). */
export function ApologyGiftStage({ giftType, onContinue }: { giftType?: string; onContinue: () => void }) {
  const gift = GIFT_COPY[giftType ?? "flower-bouquet"] ?? GIFT_COPY["flower-bouquet"];

  return (
    <StageShell title={gift.label} subtitle={gift.note} onContinue={onContinue}>
      <motion.span
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150 }}
        className="inline-block text-8xl"
      >
        {gift.emoji}
      </motion.span>
    </StageShell>
  );
}
