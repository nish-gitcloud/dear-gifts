"use client";

import { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./shared";

const MAX_WISHES = 7;
const DEFAULT_WISHES = 6;
const MAX_WORDS = 20;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Module-level counter (not component state) purely to hand out unique,
// content-independent slot ids — see the comment on `ids` state below for
// why identity must never be derived from the wish's own text.
let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `wish-${idCounter}`;
}

/**
 * Pop-up Wishes editor — up to 7 balloons, 15–20 words each (spec section
 * 22). Defaults to 6 empty balloons so the step feels ready to fill in
 * immediately, rather than starting empty and requiring repeated "+ Add
 * Wish" taps.
 */
export function WishListField({ value, onChange }: FieldProps<string[]>) {
  const wishes = (value as string[]) ?? [];

  // Stable per-slot identity, completely independent of what's typed into
  // it. The previous implementation keyed each row on `${idx}-${wish.slice(0,
  // 6)}` — the moment someone typed a single character, that key changed,
  // React tore down and remounted the textarea, and focus (and the cursor
  // position) was lost after every keystroke. These ids are handed out once
  // per slot (lazily seeded from whatever `wishes` already has on first
  // render — e.g. a resumed draft) and only ever updated in event handlers,
  // never derived during render itself.
  const [ids, setIds] = useState<string[]>(() => wishes.map(() => nextId()));

  // Always show at least 6 wish slots — a brand-new gift starts fully
  // empty, but a demo-seeded draft (spec ask: every field should carry a
  // default value) may start with just 1-2 example wishes, and topping that
  // up to 6 rather than skipping entirely is what keeps both asks true at
  // once. Existing wishes (typed or seeded) are always preserved and never
  // reordered — this only ever APPENDS empty trailing slots, never removes
  // or clobbers content someone already has (a resumed draft included).
  useEffect(() => {
    const current = Array.isArray(value) ? value : [];
    if (current.length >= DEFAULT_WISHES) return;
    const padCount = DEFAULT_WISHES - current.length;
    const seeded = [...current, ...Array.from({ length: padCount }, () => "")];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time top-up of a brand-new/under-filled field to a minimum of 6 slots, gated on the existing draft length, not derivable during render.
    setIds((prev) => [...prev, ...Array.from({ length: padCount }, () => nextId())]);
    onChange(seeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(idx: number, text: string) {
    const next = [...wishes];
    next[idx] = text;
    onChange(next);
  }

  function add() {
    if (wishes.length >= MAX_WISHES) return;
    setIds((prev) => [...prev, nextId()]);
    onChange([...wishes, ""]);
  }

  function remove(idx: number) {
    setIds((prev) => prev.filter((_, i) => i !== idx));
    onChange(wishes.filter((_, i) => i !== idx));
  }

  function handleReorder(newIds: string[]) {
    const textById = new Map(ids.map((id, i) => [id, wishes[i]]));
    setIds(newIds);
    onChange(newIds.map((id) => textById.get(id) ?? ""));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[#241A17]">Wishes</span>
        <span className="text-xs text-black/40">
          {wishes.length}/{MAX_WISHES} balloons
        </span>
      </div>
      <Reorder.Group axis="y" values={ids} onReorder={handleReorder} className="space-y-2">
        {ids.map((id, idx) => {
          const wish = wishes[idx] ?? "";
          const words = wordCount(wish);
          const over = words > MAX_WORDS;
          return (
            <Reorder.Item key={id} value={id} className="flex items-start gap-2">
              <span className="mt-2 cursor-grab select-none text-lg text-black/30">🎈</span>
              <div className="flex-1">
                <span className="mb-1 block text-[11px] font-medium text-black/40">Wish {idx + 1}</span>
                <textarea
                  value={wish}
                  onChange={(e) => update(idx, e.target.value)}
                  rows={2}
                  placeholder="A little wish..."
                  className={cn(
                    "w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm text-[#241A17] outline-none",
                    over ? "border-red-400" : "border-black/10 focus:border-[#E85C7B]"
                  )}
                />
                <span className={cn("text-[11px]", over ? "text-red-500" : "text-black/40")}>
                  {words}/{MAX_WORDS} words
                </span>
              </div>
              <button type="button" onClick={() => remove(idx)} className="touch-target mt-2 text-black/40 hover:text-red-500">
                ✕
              </button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      {wishes.length < MAX_WISHES && (
        <Button type="button" variant="ghost" size="md" className="mt-3 px-0" onClick={add}>
          + Add Wish
        </Button>
      )}
    </div>
  );
}
