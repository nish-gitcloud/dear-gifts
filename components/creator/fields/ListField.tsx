"use client";

import { Button } from "@/components/ui/Button";
import type { FieldProps } from "./shared";

/** Simple growable list of short text entries — used for "A Jar of Reasons". */
export function ListField({ field, value, onChange }: FieldProps<string[]>) {
  const items = (value as string[]) ?? [];
  const max = field.maxItems ?? 20;

  function update(idx: number, text: string) {
    const next = [...items];
    next[idx] = text;
    onChange(next);
  }

  function add() {
    if (items.length >= max) return;
    onChange([...items, ""]);
  }

  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-[#241A17]">{field.label}</span>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => update(idx, e.target.value)}
              placeholder={`Reason #${idx + 1}`}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#241A17] outline-none focus:border-[#E85C7B]"
            />
            <button type="button" onClick={() => remove(idx)} className="touch-target text-black/40 hover:text-red-500">
              ✕
            </button>
          </div>
        ))}
      </div>
      {field.helpText && <p className="mt-1.5 text-xs text-black/50">{field.helpText}</p>}
      {items.length < max && (
        <Button type="button" variant="ghost" size="md" className="mt-3 px-0" onClick={add}>
          + Add
        </Button>
      )}
    </div>
  );
}
