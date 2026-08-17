"use client";

import { motion } from "framer-motion";
import { StageShell } from "../StageShell";
import type { Milestone } from "@/components/creator/fields/MilestoneListField";

/** "Tell Your Story" milestone timeline (spec sections 13/25). */
export function TimelineStage({ milestones, onContinue }: { milestones?: Milestone[]; onContinue: () => void }) {
  const items = (milestones ?? []).filter((m) => m.label || m.note);
  const display = items.length
    ? items
    : [{ label: "We met", date: "", note: "The day everything changed." }];

  return (
    <StageShell title="Our Story" onContinue={onContinue}>
      <div className="space-y-6 text-left">
        {display.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="relative border-l-2 border-current/20 pl-5"
          >
            <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-[var(--dg-primary,currentColor)]" />
            <p className="font-display text-lg font-semibold">{m.label || "A moment"}</p>
            {m.date && <p className="text-xs opacity-50">{m.date}</p>}
            {m.note && <p className="mt-1 text-sm opacity-75">{m.note}</p>}
          </motion.div>
        ))}
      </div>
    </StageShell>
  );
}
