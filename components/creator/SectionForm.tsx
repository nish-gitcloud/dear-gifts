"use client";

import { motion } from "framer-motion";
import type { GiftSectionConfig } from "@/types/gift";
import { FieldRenderer } from "./fields/FieldRenderer";
import { isFieldFilled, validateFieldValue } from "./fields/shared";

/**
 * Renders exactly one section per screen (spec section 65: "one emotional
 * section per screen"). `onFieldChange` writes straight into the wizard
 * store, so autosave is implicit. When `showErrors` is set (the person tried
 * to continue with an incomplete/invalid section), a specific error message
 * appears under each field that needs attention, instead of the Continue
 * button just silently staying disabled.
 */
export function SectionForm({
  section,
  values,
  showErrors = false,
  onFieldChange,
}: {
  section: GiftSectionConfig;
  values: Record<string, unknown>;
  showErrors?: boolean;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) {
  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl"
    >
      <h2 className="font-display text-2xl font-semibold text-[#241A17] sm:text-3xl">{section.title}</h2>
      {section.description && <p className="mt-2 text-sm text-black/55">{section.description}</p>}

      <div className="mt-8 space-y-8">
        {section.fields.map((field) => {
          const error = showErrors ? validateFieldValue(field, values?.[field.id]) : undefined;
          return (
            <div key={field.id}>
              <FieldRenderer field={field} value={values?.[field.id]} onChange={(v) => onFieldChange(field.id, v)} />
              {error && <p className="mt-1.5 text-xs font-medium text-red-500">⚠ {error}</p>}
            </div>
          );
        })}
        {section.fields.length === 0 && (
          <p className="rounded-2xl bg-black/5 px-4 py-6 text-center text-sm text-black/50">
            This is an interactive moment the recipient will experience directly — nothing to fill in here.
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function isSectionComplete(section: GiftSectionConfig, values: Record<string, unknown>): boolean {
  return section.fields.every((field) => {
    if (!isFieldFilled(field, values?.[field.id])) return false;
    // Media uploads must finish (or fail-and-be-removed) before a creator
    // can move on — otherwise a still-uploading item's local blob: URL could
    // get saved into the gift, which breaks for the recipient (spec section
    // 45: no fake/incomplete backend data reaching a real gift).
    if (field.type === "media-upload" || field.type === "memory-list") {
      const items = (values?.[field.id] as Array<{ status?: string }> | undefined) ?? [];
      return items.every((item) => item.status === "done" || item.status === undefined);
    }
    return true;
  });
}
