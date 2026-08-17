"use client";

import type { FieldProps } from "./shared";

/**
 * Secret 4-digit PIN (spec section 13) — a single code input only. The raw
 * PIN only ever lives in this form's local state + the wizard's localStorage
 * draft — it is hashed server-side the moment the gift is created
 * (lib/pin.ts) and never stored or transmitted as plaintext beyond that.
 */
export function PinField({ field, value, onChange }: FieldProps<string>) {
  const pin = (value as string) ?? "";
  const digitsOnly = (raw: string) => raw.replace(/\D/g, "").slice(0, 4);

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-[#241A17]">
        {field.label}
        {field.required && <span className="text-[#E85C7B]"> *</span>}
      </span>
      <input
        type="tel"
        inputMode="numeric"
        value={pin}
        onChange={(e) => onChange(digitsOnly(e.target.value))}
        placeholder="••••"
        aria-label="Secret 4-digit code"
        className="w-28 rounded-2xl border border-black/10 bg-white px-3 py-3 text-center text-lg font-semibold tracking-[0.4em] text-[#241A17] outline-none transition focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
      />
      {field.helpText && <p className="mt-1.5 text-xs text-black/50">{field.helpText}</p>}
    </div>
  );
}
