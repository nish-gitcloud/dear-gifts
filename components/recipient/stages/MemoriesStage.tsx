"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StageShell } from "../StageShell";
import type { UploadedMediaMeta } from "@/components/creator/fields/MediaUploadField";
import { cn } from "@/lib/utils";

const PLACEHOLDER_MEMORIES = [
  { id: "demo-1", caption: "That perfect afternoon" },
  { id: "demo-2", caption: "The trip we almost cancelled" },
  { id: "demo-3", caption: "Just another ordinary, perfect day" },
];

const STICKERS = ["🌸", "⭐", "💫", "🌿"];

function MemoryImage({
  src,
  alt,
  className,
  fit = "cover",
}: {
  src: string;
  alt: string;
  className?: string;
  /** "contain" letterboxes the full photo instead of cropping it — used by
   * the Cinema layout, where a fixed 16:9 frame would otherwise chop off
   * the top/sides of any portrait or square real photo. */
  fit?: "cover" | "contain";
}) {
  const [failed, setFailed] = useState(false);
  // An empty `src` (placeholder/demo entries with no real photo yet) must
  // never reach an <img> at all — passing "" makes the browser re-request
  // the current page as an "image" (a real, documented footgun, not just a
  // cosmetic warning), which is exactly the console error this was
  // throwing. Treat "no src" the same as "failed to load" up front.
  if (failed || !src) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1 bg-black/5 text-center", className)}>
        <span className="text-2xl opacity-50">🖼️</span>
        <span className="px-2 text-[9px] leading-tight opacity-40">Photo unavailable</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(fit === "contain" ? "object-contain" : "object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}

type MemoryEntry = { id: string; kind: UploadedMediaMeta["kind"]; previewUrl: string; caption?: string };

/** Single-frame "projector" carousel — one memory at a time, with a film-strip header and a 01/N counter, like flipping through a reel. */
function CinemaLayout({ items }: { items: MemoryEntry[] }) {
  const [index, setIndex] = useState(0);
  const item = items[index];

  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="mb-2 flex items-center justify-between rounded-t-xl bg-black px-3 py-1.5 text-white">
        <div className="flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-white/30" />
          ))}
        </div>
        <span className="text-[10px] font-semibold tracking-wide">
          {String(index + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
        </span>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-b-xl bg-black shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            {item.kind === "image" ? (
              <MemoryImage src={item.previewUrl} alt={item.caption ?? ""} className="h-full w-full" fit="contain" />
            ) : item.kind === "video" ? (
              <video src={item.previewUrl} className="h-full w-full object-contain" muted />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">🎙️</div>
            )}
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-left">
                <p className="text-xs font-medium text-white">{item.caption}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
          className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-black/5 hover:bg-black/10"
          aria-label="Previous memory"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % items.length)}
          className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-black/5 hover:bg-black/10"
          aria-label="Next memory"
        >
          →
        </button>
      </div>
    </div>
  );
}

/** Taped, slightly-tilted photos with little corner stickers — like a real scrapbook page. */
function ScrapbookLayout({ items }: { items: MemoryEntry[] }) {
  return (
    <div className="mx-auto grid max-w-sm grid-cols-2 gap-5 rounded-2xl bg-[#F3E8D6] p-5 shadow-inner">
      {items.map((item, i) => {
        const rotate = i % 2 === 0 ? -6 : 5;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate }}
            transition={{ delay: i * 0.08 }}
            className="relative rounded-sm bg-white p-1.5 pb-4 shadow-md"
          >
            <span className="absolute -top-2 left-1/2 h-4 w-10 -translate-x-1/2 -rotate-2 bg-yellow-100/80 shadow-sm" />
            <span className="absolute -right-2 -top-2 text-lg">{STICKERS[i % STICKERS.length]}</span>
            {item.kind === "image" ? (
              <MemoryImage src={item.previewUrl} alt={item.caption ?? ""} className="h-24 w-full" />
            ) : item.kind === "video" ? (
              <video src={item.previewUrl} className="h-24 w-full object-cover" muted />
            ) : (
              <div className="flex h-24 w-full items-center justify-center bg-black/5 text-xl">🎙️</div>
            )}
            {item.caption && <p className="font-hand mt-1.5 px-1 text-center text-sm opacity-80">{item.caption}</p>}
          </motion.div>
        );
      })}
    </div>
  );
}

function PolaroidLayout({ items }: { items: MemoryEntry[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 overflow-x-auto px-1 pb-4">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, rotate: i % 2 === 0 ? -4 : 4, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ y: -4, rotate: 0 }}
          className="w-44 shrink-0 overflow-hidden rounded-2xl bg-white p-2.5 pb-3.5 text-center shadow-lg shadow-black/10"
        >
          {item.kind === "image" ? (
            <MemoryImage src={item.previewUrl} alt={item.caption ?? "A shared memory"} className="h-36 w-full rounded-xl" />
          ) : item.kind === "video" ? (
            <video src={item.previewUrl} className="h-36 w-full rounded-xl object-cover" muted />
          ) : (
            <div className="flex h-36 w-full items-center justify-center rounded-xl bg-black/5 text-2xl">🎙️</div>
          )}
          {item.caption && <p className="font-hand mt-2 px-1 text-sm leading-snug opacity-80">{item.caption}</p>}
        </motion.div>
      ))}
    </div>
  );
}

/** Memories carousel — Polaroid / Cinema / Scrapbook layouts (spec section 39), each with its own distinct visual treatment. */
export function MemoriesStage({
  layout = "polaroid",
  media,
  onContinue,
}: {
  layout?: string;
  media?: UploadedMediaMeta[];
  onContinue: () => void;
}) {
  const real = (media ?? []).filter((item) => item.previewUrl);
  // Falling back to placeholders (with an empty previewUrl, which
  // MemoryImage already renders as a graceful "Photo unavailable" card)
  // when there's no real media yet — but critically, feeding them through
  // the SAME layout-specific component below. Previously "no real media
  // yet" short-circuited to one hardcoded generic grid regardless of which
  // layout was selected, so Polaroid/Cinema/Scrapbook all looked identical
  // until real photos were added — the layout choice only visibly mattered
  // after uploads succeeded.
  const items: MemoryEntry[] = real.length > 0 ? real : PLACEHOLDER_MEMORIES.map((m) => ({ ...m, kind: "image" as const, previewUrl: "" }));

  return (
    <StageShell title="See Our Memories 🌸" subtitle="Cute Memories 💕" onContinue={onContinue}>
      {layout === "cinema" ? (
        <CinemaLayout items={items} />
      ) : layout === "scrapbook" ? (
        <ScrapbookLayout items={items} />
      ) : (
        <PolaroidLayout items={items} />
      )}
    </StageShell>
  );
}
