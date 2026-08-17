"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StageShell } from "../StageShell";
import { calculateDurationSince, type DurationBreakdown } from "@/lib/age";

const UNITS: { key: keyof DurationBreakdown; label: string }[] = [
  { key: "years", label: "Years" },
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
];

/**
 * "Happy Birthday {name}" + a dynamically computed age/time counter (spec
 * section 37). Never hardcoded — recalculated from the actual birth date
 * every time the stage mounts.
 */
export function BirthdayRevealStage({
  name,
  birthDate,
  onContinue,
}: {
  name: string;
  birthDate: string;
  onContinue: () => void;
}) {
  // Computed once via a lazy initializer rather than an effect+setState pair
  // — this stage mounts fresh each time the recipient reaches it (React key
  // changes upstream), so a one-time "now" read at mount is exactly what we
  // want rather than a value that silently drifts across re-renders.
  const [duration] = useState<DurationBreakdown | null>(() =>
    birthDate ? calculateDurationSince(birthDate) : null
  );

  return (
    <StageShell title={`Happy Birthday ${name}`} subtitle="The World Has Been Better Since ❤️" onContinue={onContinue}>
      {duration && (
        <div className="grid grid-cols-4 gap-2">
          {UNITS.map((u, i) => (
            <motion.div
              key={u.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="rounded-2xl bg-black/5 px-2 py-3"
            >
              <p className="font-display text-lg font-semibold sm:text-xl">{duration[u.key].toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-wide opacity-60">{u.label}</p>
            </motion.div>
          ))}
        </div>
      )}
    </StageShell>
  );
}
