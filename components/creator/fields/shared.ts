import type { SectionField } from "@/types/gift";

export interface FieldProps<T = unknown> {
  field: SectionField;
  value: T;
  onChange: (value: T) => void;
  error?: string;
}

/**
 * Returns a human-readable validation error for a field's current value, or
 * undefined if it's fine. Covers the required-field check plus a few
 * concrete format checks (phone, PIN, and any field.validation.pattern) —
 * used to show real, specific messages instead of just silently disabling
 * the Continue button.
 */
export function validateFieldValue(field: SectionField, value: unknown): string | undefined {
  if (!isFieldFilled(field, value)) {
    return field.required ? "This is required." : undefined;
  }

  if (field.type === "phone" && typeof value === "string" && value.trim()) {
    // A "pure" mobile number: exactly 10 digits, or 12 with a leading "91"
    // country code — not just "10 or more digits", which used to let
    // obviously-wrong values (too long, missing digits padded with
    // punctuation, etc.) slip through as valid.
    const digits = value.replace(/\D/g, "");
    const localDigits = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
    if (localDigits.length !== 10 || !/^[6-9]\d{9}$/.test(localDigits)) {
      return "Enter a valid 10-digit mobile number.";
    }
  }

  if (field.type === "pin" && typeof value === "string" && value.trim()) {
    if (!/^\d{4}$/.test(value)) return "PIN must be exactly 4 digits.";
  }

  if (field.validation?.pattern && typeof value === "string" && value.trim()) {
    try {
      const re = new RegExp(field.validation.pattern);
      if (!re.test(value)) return field.validation.message ?? "That doesn't look right.";
    } catch {
      // Malformed pattern in config — never let a bad regex break the form.
    }
  }

  return undefined;
}

/** Emotional prompt copy per field type, e.g. "Create your secret code" for PIN fields. */
export function isFieldFilled(field: SectionField, value: unknown): boolean {
  if (!field.required) return true;
  if (field.type === "memory-list") {
    const items = (value as Array<{ previewUrl?: string }> | undefined) ?? [];
    const filled = items.filter((i) => i.previewUrl && i.previewUrl.trim().length > 0);
    return filled.length >= (field.minItems ?? 1);
  }
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null;
}
