"use client";

import type { FieldProps } from "./shared";

export function DateField({ field, value, onChange }: FieldProps<string>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#241A17]">
        {field.label}
        {field.required && <span className="text-[#E85C7B]"> *</span>}
      </span>
      <input
        type="date"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        max={new Date().toISOString().slice(0, 10)}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-[#241A17] outline-none transition focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
      />
      {field.helpText && <span className="mt-1.5 block text-xs text-black/50">{field.helpText}</span>}
    </label>
  );
}
