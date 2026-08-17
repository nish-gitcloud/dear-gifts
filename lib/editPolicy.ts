/**
 * Whitelist of what a creator may change after payment without it counting
 * as reusing the paid gift (spec section 6). Everything else — theme, gift
 * wrap, occasion, paid game/interactive element, recipient identity — must
 * go through "Create New Gift" / Duplicate (a fresh payment).
 *
 * Keyed by section id (matches GiftSectionConfig.id / gift_sections.section_type).
 */
export const EDITABLE_FIELDS: Record<string, string[]> = {
  recipient: ["recipientName", "pinHint"], // NOT secretPin, birthDate, anniversaryDate — identity-defining
  welcome: ["introTitle", "introSubtitle"],
  wishes: ["wishes"],
  scratch: ["scratchTitle", "scratchMessage"],
  letter: ["greeting", "body", "signOff"],
  "sorry-letter": ["sorryMessage"],
  memories: ["media"], // replace/add/remove/reorder photos — not the layout choice
  story: ["milestones"],
  "then-vs-now": ["thenPhoto", "nowPhoto", "thenLabel", "nowLabel"],
  "jar-of-reasons": ["reasons"],
  pledge: ["pledgeText"],
  promise: ["promiseText"],
};

export interface EditRequest {
  sectionId: string;
  fieldId: string;
  value: unknown;
}

export function isEditAllowed(sectionId: string, fieldId: string): boolean {
  return EDITABLE_FIELDS[sectionId]?.includes(fieldId) ?? false;
}

/** Splits a batch of proposed edits into what's allowed vs. rejected, so the API can apply one and report the other. */
export function partitionEdits(edits: EditRequest[]) {
  const allowed: EditRequest[] = [];
  const rejected: EditRequest[] = [];
  for (const edit of edits) {
    (isEditAllowed(edit.sectionId, edit.fieldId) ? allowed : rejected).push(edit);
  }
  return { allowed, rejected };
}
