"use client";

import type { FieldProps } from "./shared";

export function TextField({ field, value, onChange }: FieldProps<string>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#241A17]">
        {field.label}
        {field.required && <span className="text-[#E85C7B]"> *</span>}
      </span>
      <input
        type="text"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        required={field.required}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-[#241A17] outline-none transition focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
      />
      {field.helpText && <span className="mt-1.5 block text-xs text-black/50">{field.helpText}</span>}
    </label>
  );
}

export function TextAreaField({ field, value, onChange }: FieldProps<string>) {
  const text = (value as string) ?? "";
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#241A17]">
        {field.label}
        {field.required && <span className="text-[#E85C7B]"> *</span>}
      </span>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        required={field.required}
        rows={5}
        className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-[#241A17] outline-none transition focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
      />
      <div className="mt-1.5 flex items-center justify-between text-xs text-black/50">
        <span>{field.helpText}</span>
        {field.maxLength && (
          <span>
            {text.length}/{field.maxLength}
          </span>
        )}
      </div>
    </label>
  );
}
