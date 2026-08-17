"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { validateFile, kindFromMime } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { UploadedMediaMeta } from "./MediaUploadField";
import type { FieldProps } from "./shared";

// Module-level (not inside the component body) — impure time/random id
// generation must stay outside React's render purity rules, same pattern as
// MediaUploadField.tsx's generateMediaItemId.
let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `memory-${idCounter}-${Date.now().toString(36)}`;
}

/**
 * "Your Favourite Memories" editor — a numbered "Caption 1 / 2 / 3..." block
 * per memory, each pairing a caption with either a pasted image URL or an
 * uploaded file (spec: structured memory slots rather than one bulk
 * dropzone). Slots default to `minItems` empty ones so the step feels ready
 * to fill in immediately.
 */
export function MemoriesField({ field, value, onChange }: FieldProps<UploadedMediaMeta[]>) {
  const items = useMemo(() => (value as UploadedMediaMeta[]) ?? [], [value]);
  const min = field.minItems ?? 3;
  const max = field.maxItems ?? 12;
  const [error, setError] = useState<string | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Seed `min` empty slots on first mount if nothing's there yet — never
  // clobber a resumed draft that already has content.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    if (!value || (Array.isArray(value) && value.length === 0)) {
      const seeded = Array.from({ length: min }, () => ({
        id: nextId(),
        name: "",
        size: 0,
        kind: "image" as const,
        previewUrl: "",
        status: "done" as const,
        caption: "",
      }));
      onChange(seeded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patch(id: string, patch: Partial<UploadedMediaMeta>) {
    const next = itemsRef.current.map((i) => (i.id === id ? { ...i, ...patch } : i));
    itemsRef.current = next;
    onChange(next);
  }

  function addSlot() {
    if (items.length >= max) return;
    const next = [
      ...items,
      { id: nextId(), name: "", size: 0, kind: "image" as const, previewUrl: "", status: "done" as const, caption: "" },
    ];
    itemsRef.current = next;
    onChange(next);
  }

  function removeSlot(id: string) {
    if (items.length <= min) {
      // Keep at least `min` slots — clear it instead of removing.
      patch(id, { caption: "", previewUrl: "", name: "", status: "done" });
      return;
    }
    const next = items.filter((i) => i.id !== id);
    itemsRef.current = next;
    onChange(next);
  }

  async function uploadFile(file: File, id: string) {
    setError(null);
    const check = validateFile(file);
    if (!check.valid) {
      setError(check.error ?? "That file couldn't be added.");
      return;
    }
    const kind = kindFromMime(file.type)!;
    const blobUrl = URL.createObjectURL(file);
    patch(id, { name: file.name, size: file.size, kind, previewUrl: blobUrl, status: "uploading" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      patch(id, { previewUrl: data.url, publicId: data.publicId, status: "done" });
    } catch {
      patch(id, { status: "error" });
    }
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
      {field.helpText && <p className="mb-3 -mt-1 text-xs text-black/50">{field.helpText}</p>}
      {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-black/40">
                  Caption {idx + 1}
                </span>
                {items.length > min && (
                  <button
                    type="button"
                    onClick={() => removeSlot(item.id)}
                    className="touch-target text-xs text-black/40 hover:text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex-1 space-y-2.5">
                  <input
                    type="text"
                    value={item.caption ?? ""}
                    onChange={(e) => patch(item.id, { caption: e.target.value })}
                    placeholder="A little caption for this memory..."
                    maxLength={120}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-[#241A17] outline-none transition focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.previewUrl.startsWith("blob:") ? "" : item.previewUrl}
                      onChange={(e) => patch(item.id, { previewUrl: e.target.value, kind: "image", status: "done" })}
                      placeholder="Image URL or Upload"
                      className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-[#241A17] outline-none transition focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputsRef.current[item.id]?.click()}
                      className="touch-target shrink-0 rounded-xl bg-black/5 px-3 text-xs font-medium text-[#241A17] hover:bg-black/10"
                    >
                      Upload image
                    </button>
                    <input
                      ref={(el) => {
                        fileInputsRef.current[item.id] = el;
                      }}
                      type="file"
                      accept="image/*,video/*,audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFile(file, item.id);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>

                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-black/5">
                  {item.previewUrl ? (
                    item.kind === "video" ? (
                      <video src={item.previewUrl} className="h-full w-full object-cover" muted />
                    ) : item.kind === "audio" ? (
                      <span className="text-2xl">🎙️</span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.previewUrl} alt={item.caption || "Memory preview"} className="h-full w-full object-cover" />
                    )
                  ) : (
                    <span className="text-xl text-black/25">🖼️</span>
                  )}
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    </div>
                  )}
                  {item.status === "error" && (
                    <div className={cn("absolute inset-0 flex items-center justify-center bg-black/50 text-[9px] text-white")}>
                      Failed
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length < max && (
        <button
          type="button"
          onClick={addSlot}
          className="touch-target mt-4 flex items-center gap-1.5 rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-[#241A17] hover:bg-black/10"
        >
          + Add memory
        </button>
      )}
    </div>
  );
}
