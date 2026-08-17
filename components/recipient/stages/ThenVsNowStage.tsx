"use client";

import { motion } from "framer-motion";
import { StageShell } from "../StageShell";
import type { UploadedMediaMeta } from "@/components/creator/fields/MediaUploadField";

/** "Then vs Now" side-by-side comparison (spec section 13). */
export function ThenVsNowStage({
  thenPhoto,
  nowPhoto,
  thenLabel,
  nowLabel,
  onContinue,
}: {
  thenPhoto?: UploadedMediaMeta[];
  nowPhoto?: UploadedMediaMeta[];
  thenLabel?: string;
  nowLabel?: string;
  onContinue: () => void;
}) {
  const then = thenPhoto?.[0];
  const now = nowPhoto?.[0];

  return (
    <StageShell title="Then vs Now" onContinue={onContinue}>
      <div className="flex gap-4">
        {[
          { photo: then, label: thenLabel || "Then" },
          { photo: now, label: nowLabel || "Now" },
        ].map((side, i) => (
          <motion.div
            key={side.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.2 }}
            className="flex-1"
          >
            <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl bg-black/10">
              {side.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={side.photo.previewUrl} alt={side.label} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl opacity-40">🖼️</span>
              )}
            </div>
            <p className="mt-2 text-sm font-medium opacity-80">{side.label}</p>
          </motion.div>
        ))}
      </div>
    </StageShell>
  );
}
