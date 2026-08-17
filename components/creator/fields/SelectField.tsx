"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PriceBadge } from "@/components/ui/PriceBadge";
import type { FieldProps } from "./shared";

/** Card-grid select — used for cakes, toasts, apology gifts, games, music presets, etc. */
export function SelectField({ field, value, onChange }: FieldProps<string>) {
  return (
    <div>
      <span className="mb-3 block text-sm font-medium text-[#241A17]">
        {field.label}
        {field.required && <span className="text-[#E85C7B]"> *</span>}
      </span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {field.options?.map((opt) => {
          const selected = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(opt.value)}
              className={cn(
                "touch-target flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-colors",
                selected ? "border-[#E85C7B] bg-[#E85C7B]/5" : "border-black/10 bg-white hover:border-black/20"
              )}
            >
              <span className="text-sm font-semibold text-[#241A17]">{opt.label}</span>
              {opt.description && <span className="text-xs text-black/50">{opt.description}</span>}
              {typeof opt.price === "number" && <PriceBadge amount={opt.price} className="mt-1" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
