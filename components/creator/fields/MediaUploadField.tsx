"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { validateFile, formatBytes, kindFromMime, MEDIA_LIMITS_BYTES } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./shared";

// Module-level (not inside the component body) so this impure, time/random-
// based id generation is clearly outside React's render purity rules — see
// app/create/[occasion]/summary/page.tsx's mockPaymentId() for the same pattern.
function generateMediaItemId(file: File): string {
  return `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface UploadedMediaMeta {
  id: string;
  name: string;
  size: number;
  kind: "image" | "video" | "audio";
  /**
   * A real, durable CDN URL once `status` is "done" — what actually gets
   * saved into the gift's section data and shown to the recipient later.
   * Starts as a local blob: URL (instant preview only) while `status` is
   * "uploading"; blob URLs don't survive a reload and are never valid on
   * another device, so this MUST be swapped for the real Cloudinary URL
   * before the gift can be created (spec section 45: no fake backend data).
   */
  previewUrl: string;
  publicId?: string;
  status: "uploading" | "done" | "error";
  /** Optional per-memory caption (spec: "Your Favourite Memories" numbered caption+image slots). */
  caption?: string;
}

/**
 * Upload UI for photos/videos/voice notes (spec sections 20 & 54). Each file
 * shows an instant local preview, then uploads to POST /api/uploads (which
 * calls services/cloudinary.ts) in the background; once that resolves, the
 * item's URL is swapped from the local blob: URL to the real CDN URL so
 * what's ultimately saved with the gift resolves for the recipient too.
 * Validates size/type client-side immediately so the person never wastes
 * time uploading something the server will reject anyway.
 */
const KIND_LABELS: Record<"image" | "video" | "audio", { picker: string; plural: string }> = {
  image: { picker: "image/*", plural: "photos" },
  video: { picker: "video/*", plural: "videos" },
  audio: { picker: "audio/*", plural: "audio files" },
};

export function MediaUploadField({ field, value, onChange }: FieldProps<UploadedMediaMeta[]>) {
  const items = useMemo(() => (value as UploadedMediaMeta[]) ?? [], [value]);
  const [error, setError] = useState<string | null>(null);
  // Restricting which kinds a field accepts — e.g. an image-only puzzle
  // photo field shouldn't offer an audio-file picker, and a voice-note
  // field shouldn't offer photos/videos — both in the native file picker
  // (via `accept`) and in validation (a renamed/mismatched file can't slip
  // through just because the OS picker showed it anyway).
  const allowedKinds = field.mediaAccept ?? (["image", "video", "audio"] as const);
  const acceptAttr = allowedKinds.map((k) => KIND_LABELS[k].picker).join(",");
  const addLabel =
    allowedKinds.length === 3
      ? "Tap to add photos, videos, or voice notes"
      : `Tap to add ${allowedKinds.map((k) => KIND_LABELS[k].plural).join(" or ")}`;
  // Cloudinary isn't configured on every deployment (this scaffold's mock
  // adapter returns a deterministic but non-fetchable placeholder URL, see
  // services/cloudinary.ts) — track which items' *real* URL 404s so the
  // preview grid can say so plainly instead of showing a broken-image icon.
  const [unresolvedIds, setUnresolvedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const max = field.maxItems ?? 12;

  // Always-current snapshot of `items`, so async upload completions merge
  // against the latest array instead of whatever was in scope when the
  // upload started (the field is controlled by the wizard store, which may
  // have changed in the meantime — e.g. another file finished first). Refs
  // must be written in an effect, not during render (react-hooks/refs).
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  function patchItem(id: string, patch: Partial<UploadedMediaMeta>) {
    const next = itemsRef.current.map((i) => (i.id === id ? { ...i, ...patch } : i));
    itemsRef.current = next;
    onChange(next);
  }

  /**
 * Real phone photos routinely land at 12–25MB (this is exactly what showed
 * up as a puzzle-image upload that silently never took) — well over the
 * 10MB image limit in lib/media.ts. Rejecting those outright with a small
 * error string under the upload button is easy to miss, and the file just
 * never appears — from the creator's side it looks like "I added a photo
 * and it didn't take it." Downscaling oversized images client-side (long
 * edge capped at 1920px, re-encoded as JPEG) instead means the upload just
 * works: the recipient-facing use cases here (puzzle tiles, memory photos,
 * scratch card art) never need more resolution than that anyway.
 */
async function compressImageIfOversized(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size <= MEDIA_LIMITS_BYTES.image) {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const maxDim = 1920;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) return file;
    const compressedName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], compressedName, { type: "image/jpeg" });
  } catch {
    // Any failure here (unsupported format, canvas issue, ...) just falls
    // through to the original file — validateFile below still catches an
    // oversized result and reports it clearly rather than failing silently.
    return file;
  }
}

async function uploadFile(file: File, id: string) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      patchItem(id, { previewUrl: data.url, publicId: data.publicId, status: "done" });
    } catch {
      patchItem(id, { status: "error" });
    }
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setError(null);
    const next = [...items];
    const toUpload: Array<{ file: File; id: string }> = [];
    for (const rawFile of Array.from(fileList)) {
      if (next.length >= max) {
        setError(`You can add up to ${max} files.`);
        break;
      }
      const rawKind = kindFromMime(rawFile.type);
      if (!rawKind || !allowedKinds.includes(rawKind)) {
        setError(`Only ${allowedKinds.map((k) => KIND_LABELS[k].plural).join(" or ")} can be added here.`);
        continue;
      }
      const file = await compressImageIfOversized(rawFile);
      const check = validateFile(file);
      if (!check.valid) {
        setError(check.error ?? "That file couldn't be added.");
        continue;
      }
      const kind = kindFromMime(file.type)!;
      const id = generateMediaItemId(file);
      next.push({
        id,
        name: file.name,
        size: file.size,
        kind,
        previewUrl: URL.createObjectURL(file),
        status: "uploading",
      });
      toUpload.push({ file, id });
      // Reflect each file as soon as it's ready instead of waiting for the
      // whole batch to finish compressing — matters most when someone picks
      // several large photos at once.
      itemsRef.current = [...next];
      onChange([...next]);
    }
    for (const { file, id } of toUpload) uploadFile(file, id);
  }

  function remove(id: string) {
    const next = items.filter((i) => i.id !== id);
    itemsRef.current = next;
    onChange(next);
  }

  function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= items.length) return;
    const next = [...items];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    itemsRef.current = next;
    onChange(next);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-[#241A17]">
          {field.label}
          {field.required && <span className="text-[#E85C7B]"> *</span>}
        </span>
        <span className="text-xs text-black/40">
          {items.length}/{max}
        </span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="touch-target flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-black/15 bg-white/60 py-8 text-sm text-black/50 transition hover:border-[#E85C7B]/50 hover:text-[#E85C7B]"
      >
        <span className="text-2xl">＋</span>
        {addLabel}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptAttr}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {field.helpText && <p className="mt-1.5 text-xs text-black/50">{field.helpText}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-black/5"
            >
              {unresolvedIds.has(item.id) ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-black/10 px-2 text-center">
                  <span className="text-xl">🖼️</span>
                  <span className="text-[9px] leading-tight text-black/50">Uploaded — preview needs live storage</span>
                </div>
              ) : item.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  onError={() => setUnresolvedIds((prev) => new Set(prev).add(item.id))}
                />
              ) : item.kind === "video" ? (
                <video
                  src={item.previewUrl}
                  className="h-full w-full object-cover"
                  muted
                  onError={() => setUnresolvedIds((prev) => new Set(prev).add(item.id))}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-2xl">🎙️</div>
              )}
              {/* Always visible (not hover-gated) — hover-only controls are
                  unreachable on touch devices, and this app is mobile-first. */}
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/25 via-transparent to-black/25 p-1.5">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="touch-target flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-red-500"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => move(item.id, -1)}
                    disabled={idx === 0}
                    className={cn("touch-target rounded-full bg-white/90 px-2 text-xs", idx === 0 && "opacity-40")}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(item.id, 1)}
                    disabled={idx === items.length - 1}
                    className={cn(
                      "touch-target rounded-full bg-white/90 px-2 text-xs",
                      idx === items.length - 1 && "opacity-40"
                    )}
                  >
                    →
                  </button>
                </div>
              </div>
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[9px] text-white">
                {formatBytes(item.size)}
              </span>

              {item.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                </div>
              )}
              {item.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 text-center">
                  <span className="text-[10px] text-white">Upload failed</span>
                  <button
                    type="button"
                    onClick={() => {
                      patchItem(item.id, { status: "uploading" });
                      fetch(item.previewUrl)
                        .then((r) => r.blob())
                        .then((blob) => uploadFile(new File([blob], item.name, { type: blob.type }), item.id));
                    }}
                    className="touch-target rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-medium text-[#241A17]"
                  >
                    Retry
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
