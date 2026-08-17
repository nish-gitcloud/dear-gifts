"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./shared";

/** Multi-select cards — used for Custom Wishes' celebration elements (spec section 28). */
export function ToggleGroupField({ field, value, onChange }: FieldProps<string[]>) {
  const selected = (value as string[]) ?? [];

  function toggle(val: string) {
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  }

  return (
    <div>
      <span className="mb-3 block text-sm font-medium text-[#241A17]">{field.label}</span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {field.options?.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <motion.button
              key={opt.value}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(opt.value)}
              className={cn(
                "touch-target flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-colors",
                isSelected ? "border-[#E85C7B] bg-[#E85C7B]/5" : "border-black/10 bg-white hover:border-black/20"
              )}
            >
              <span className="text-sm font-semibold text-[#241A17]">{opt.label}</span>
              {opt.description && <span className="text-xs text-black/50">{opt.description}</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
