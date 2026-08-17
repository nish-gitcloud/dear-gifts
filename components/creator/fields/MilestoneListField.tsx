"use client";

import { Button } from "@/components/ui/Button";
import type { FieldProps } from "./shared";

export interface Milestone {
  label: string;
  date: string;
  note: string;
}

/** "Tell Your Story" milestone editor (spec section 25). */
export function MilestoneListField({ value, onChange }: FieldProps<Milestone[]>) {
  const milestones = (value as Milestone[]) ?? [];

  function update(idx: number, patch: Partial<Milestone>) {
    const next = [...milestones];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  function add() {
    onChange([...milestones, { label: "", date: "", note: "" }]);
  }

  function remove(idx: number) {
    onChange(milestones.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
      {milestones.map((m, idx) => (
        <div key={idx} className="rounded-2xl border border-black/10 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-black/40">Milestone {idx + 1}</span>
            <button type="button" onClick={() => remove(idx)} className="touch-target text-black/40 hover:text-red-500">
              ✕
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={m.label}
              onChange={(e) => update(idx, { label: e.target.value })}
              placeholder="We met"
              className="rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#E85C7B]"
            />
            <input
              type="date"
              value={m.date}
              onChange={(e) => update(idx, { date: e.target.value })}
              className="rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#E85C7B]"
            />
          </div>
          <textarea
            value={m.note}
            onChange={(e) => update(idx, { note: e.target.value })}
            placeholder="The day everything changed."
            rows={2}
            className="mt-3 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#E85C7B]"
          />
        </div>
      ))}
      <Button type="button" variant="ghost" size="md" className="px-0" onClick={add}>
        + Add Milestone
      </Button>
    </div>
  );
}
