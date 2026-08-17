"use client";

import type { FieldProps } from "./shared";

export function PhoneField({ field, value, onChange }: FieldProps<string>) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-[#241A17]">
        {field.label}
        {field.required && <span className="text-[#E85C7B]"> *</span>}
        <span className="rounded-full bg-[#E85C7B]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#E85C7B]">
          High Priority Contact
        </span>
      </span>
      <input
        type="tel"
        inputMode="tel"
        value={(value as string) ?? ""}
        onChange={(e) => {
          // Only digits, "+", spaces, and "-" survive at all (typing
          // letters/symbols is rejected outright) — and the digit COUNT is
          // separately capped at 12 (a 10-digit mobile number, optionally
          // with a 2-digit country code) so the field can never end up
          // holding something longer than an actual phone number, not just
          // something made of phone-number-shaped characters.
          const cleaned = e.target.value.replace(/[^\d+\s-]/g, "");
          const digitCount = cleaned.replace(/\D/g, "").length;
          if (digitCount > 12) return;
          onChange(cleaned);
        }}
        placeholder="+91 98765 43210"
        required={field.required}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-[#241A17] outline-none transition focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
      />
      <span className="mt-1.5 block text-xs text-black/50">
        {field.helpText ?? "Used only to help you manage this gift — never shown to the recipient."}
      </span>
    </label>
  );
}
