import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  getMockGiftById,
  getMockGiftByToken,
  getMockGiftByManageToken,
  getMockGiftsByCreator,
  getMockPinAttemptState,
  setMockPinAttemptState,
  applyMockGiftEdit,
  duplicateMockGift,
} from "@/lib/mockStore";
import { isLockedOut, nextAttemptState, verifyPin, MAX_PIN_ATTEMPTS } from "@/lib/pin";
import { isEditAllowed, type EditRequest } from "@/lib/editPolicy";
import { generateGiftToken, generateManageToken } from "@/lib/token";
import { getOccasion } from "@/config/occasions";
import { calculateWizardPriceAsync } from "@/lib/wizardPricingServer";
import { randomUUID } from "crypto";
import type { GiftRecord, OccasionId } from "@/types/gift";

export interface PublicGiftView {
  id: string;
  occasion: OccasionId;
  recipientName: string;
  pinHint: string | null;
  theme: string;
  giftWrap: string;
  status: GiftRecord["status"];
  expiresAt: string | null;
  sections: Record<string, Record<string, unknown>>;
}

/**
 * Looks up a gift by its public token. Never returns the PIN hash to
 * callers outside this module — `verifyGiftPin` is the only function
 * allowed to touch it (spec section 55/56).
 */
export async function getGiftByToken(token: string): Promise<PublicGiftView | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: gift } = await admin.from("gifts").select("*").eq("gift_token", token).maybeSingle();
    if (!gift) return null;
    const { data: sections } = await admin.from("gift_sections").select("*").eq("gift_id", gift.id);
    const sectionMap: Record<string, Record<string, unknown>> = {};
    for (const s of sections ?? []) sectionMap[s.section_type] = s.data_json;
    return {
      id: gift.id,
      occasion: gift.occasion,
      recipientName: gift.recipient_name,
      pinHint: gift.pin_hint,
      theme: gift.theme,
      giftWrap: gift.gift_wrap,
      status: gift.status,
      expiresAt: gift.expires_at,
      sections: sectionMap,
    };
  }

  const gift = getMockGiftByToken(token);
  if (!gift) return null;
  return {
    id: gift.id,
    occasion: gift.occasion,
    recipientName: gift.recipientName,
    pinHint: gift.pinHint,
    theme: gift.theme,
    giftWrap: gift.giftWrap,
    status: gift.status,
    expiresAt: gift.expiresAt,
    sections: gift.sections,
  };
}

export interface PinCheckResult {
  valid: boolean;
  locked: boolean;
  message?: string;
}

/** Server-side PIN check with brute-force lockout (spec section 56). */
export async function verifyGiftPin(giftId: string, pin: string): Promise<PinCheckResult> {
  const admin = getSupabaseAdmin();

  if (admin) {
    const { data: gift } = await admin
      .from("gifts")
      .select("secret_pin_hash, pin_failed_attempts, pin_locked_until")
      .eq("id", giftId)
      .maybeSingle();
    if (!gift) return { valid: false, locked: false, message: "Gift not found." };

    const state = { failedAttempts: gift.pin_failed_attempts ?? 0, lockedUntil: gift.pin_locked_until };
    if (isLockedOut(state)) {
      return { valid: false, locked: true, message: "Too many attempts. Try again in a few minutes." };
    }

    const correct = await verifyPin(pin, gift.secret_pin_hash);
    const next = nextAttemptState(state, correct);
    await admin
      .from("gifts")
      .update({ pin_failed_attempts: next.failedAttempts, pin_locked_until: next.lockedUntil })
      .eq("id", giftId);

    if (correct) return { valid: true, locked: false };
    const locked = next.failedAttempts >= MAX_PIN_ATTEMPTS;
    return {
      valid: false,
      locked,
      message: locked ? "Too many attempts. Try again in a few minutes." : "That code doesn't seem right. Try again.",
    };
  }

  // Mock-store path
  const gift = getMockGiftById(giftId);
  if (!gift) return { valid: false, locked: false, message: "Gift not found." };

  const state = getMockPinAttemptState(giftId);
  if (isLockedOut(state)) {
    return { valid: false, locked: true, message: "Too many attempts. Try again in a few minutes." };
  }

  const correct = await verifyPin(pin, gift.secretPinHash);
  const next = nextAttemptState(state, correct);
  setMockPinAttemptState(giftId, next);

  if (correct) return { valid: true, locked: false };
  const locked = next.failedAttempts >= MAX_PIN_ATTEMPTS;
  return {
    valid: false,
    locked,
    message: locked ? "Too many attempts. Try again in a few minutes." : "That code doesn't seem right. Try again.",
  };
}

export interface ManageGiftView {
  id: string;
  occasion: OccasionId;
  recipientName: string;
  pinHint: string | null;
  theme: string;
  giftWrap: string;
  status: GiftRecord["status"];
  paymentStatus: GiftRecord["paymentStatus"];
  giftToken: string;
  manageToken: string;
  createdAt: string;
  expiresAt: string | null;
  sections: Record<string, Record<string, unknown>>;
  views: number;
}

/**
 * Looks up a gift by its long-lived *management* token — the link given
 * only to a guest creator right after payment (spec section 6). Distinct
 * from `getGiftByToken`, which is the short public recipient-facing link.
 * Never returns the PIN hash.
 */
export async function getGiftByManageToken(token: string): Promise<ManageGiftView | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: gift } = await admin.from("gifts").select("*").eq("manage_token", token).maybeSingle();
    if (!gift) return null;
    const { data: sections } = await admin.from("gift_sections").select("*").eq("gift_id", gift.id);
    const sectionMap: Record<string, Record<string, unknown>> = {};
    for (const s of sections ?? []) sectionMap[s.section_type] = s.data_json;
    const { count } = await admin
      .from("gift_views")
      .select("id", { count: "exact", head: true })
      .eq("gift_id", gift.id);
    return {
      id: gift.id,
      occasion: gift.occasion,
      recipientName: gift.recipient_name,
      pinHint: gift.pin_hint,
      theme: gift.theme,
      giftWrap: gift.gift_wrap,
      status: gift.status,
      paymentStatus: gift.payment_status,
      giftToken: gift.gift_token,
      manageToken: gift.manage_token,
      createdAt: gift.created_at,
      expiresAt: gift.expires_at,
      sections: sectionMap,
      views: count ?? 0,
    };
  }

  const gift = getMockGiftByManageToken(token);
  if (!gift) return null;
  return {
    id: gift.id,
    occasion: gift.occasion,
    recipientName: gift.recipientName,
    pinHint: gift.pinHint,
    theme: gift.theme,
    giftWrap: gift.giftWrap,
    manageToken: gift.manageToken,
    status: gift.status,
    paymentStatus: gift.paymentStatus,
    giftToken: gift.giftToken,
    createdAt: gift.createdAt,
    expiresAt: gift.expiresAt,
    sections: gift.sections,
    views: gift.views,
  };
}

export interface CreatorGiftSummary {
  id: string;
  occasion: OccasionId;
  recipientName: string;
  theme: string;
  status: GiftRecord["status"];
  paymentStatus: GiftRecord["paymentStatus"];
  giftToken: string;
  manageToken: string;
  createdAt: string;
  expiresAt: string | null;
  views: number;
}

/**
 * Lists every gift owned by a signed-in creator for the "My Gifts"
 * dashboard (spec section 6). Deliberately excludes `sections` — the
 * dashboard only needs enough to render a card and link into
 * `/manage/[manageToken]` for the full editing experience, not the full
 * content payload for every gift on every page load.
 */
export async function listGiftsForCreator(creatorId: string): Promise<CreatorGiftSummary[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: gifts } = await admin
      .from("gifts")
      .select("*")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false });
    if (!gifts) return [];
    return Promise.all(
      gifts.map(async (gift) => {
        const { count } = await admin
          .from("gift_views")
          .select("id", { count: "exact", head: true })
          .eq("gift_id", gift.id);
        return {
          id: gift.id,
          occasion: gift.occasion,
          recipientName: gift.recipient_name,
          theme: gift.theme,
          status: gift.status,
          paymentStatus: gift.payment_status,
          giftToken: gift.gift_token,
          manageToken: gift.manage_token,
          createdAt: gift.created_at,
          expiresAt: gift.expires_at,
          views: count ?? 0,
        };
      })
    );
  }

  return getMockGiftsByCreator(creatorId).map((gift) => ({
    id: gift.id,
    occasion: gift.occasion,
    recipientName: gift.recipientName,
    theme: gift.theme,
    status: gift.status,
    paymentStatus: gift.paymentStatus,
    giftToken: gift.giftToken,
    manageToken: gift.manageToken,
    createdAt: gift.createdAt,
    expiresAt: gift.expiresAt,
    views: gift.views,
  }));
}

export interface ApplyEditsResult {
  applied: EditRequest[];
  rejected: EditRequest[];
}

/**
 * Applies only whitelisted post-payment edits (spec section 6 / lib/editPolicy.ts)
 * and writes an audit row per change. Silently drops anything not on the
 * whitelist rather than erroring, so a partially-valid batch still saves
 * what it can — the caller reports `rejected` back to the UI.
 */
export async function applyGiftEditsByManageToken(token: string, edits: EditRequest[]): Promise<ApplyEditsResult | null> {
  const applied: EditRequest[] = [];
  const rejected: EditRequest[] = [];
  for (const edit of edits) {
    if (isEditAllowed(edit.sectionId, edit.fieldId)) applied.push(edit);
    else rejected.push(edit);
  }
  if (applied.length === 0) return { applied, rejected };

  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: gift } = await admin.from("gifts").select("id").eq("manage_token", token).maybeSingle();
    if (!gift) return null;

    for (const edit of applied) {
      const { data: section } = await admin
        .from("gift_sections")
        .select("data_json")
        .eq("gift_id", gift.id)
        .eq("section_type", edit.sectionId)
        .maybeSingle();
      const oldData = (section?.data_json as Record<string, unknown>) ?? {};
      const oldValue = oldData[edit.fieldId];
      const newData = { ...oldData, [edit.fieldId]: edit.value };
      await admin
        .from("gift_sections")
        .upsert({ gift_id: gift.id, section_type: edit.sectionId, data_json: newData }, { onConflict: "gift_id,section_type" });
      await admin.from("gift_edits").insert({
        gift_id: gift.id,
        field: `${edit.sectionId}.${edit.fieldId}`,
        old_value: JSON.stringify(oldValue ?? null),
        new_value: JSON.stringify(edit.value),
      });
    }
    return { applied, rejected };
  }

  const gift = getMockGiftByManageToken(token);
  if (!gift) return null;
  for (const edit of applied) {
    applyMockGiftEdit(gift.id, edit.sectionId, edit.fieldId, edit.value);
  }
  return { applied, rejected };
}

export interface DuplicateGiftResult {
  giftId: string;
  giftToken: string;
  manageToken: string;
  occasion: OccasionId;
  amount: number;
}

/**
 * Clones a gift's content into a fresh `pending_payment` draft (spec
 * section 6: "Create New Gift" / Duplicate) — a new payment is required to
 * activate it. The theme, wrap, occasion and paid interactive elements
 * carry over so the creator only has to review, not re-build, everything.
 * `amount` is recomputed from the cloned content (never trusted from the
 * client) so /duplicate/[giftId]'s checkout can create a Razorpay order
 * without re-running the whole wizard.
 */
export async function duplicateGiftByManageToken(token: string): Promise<DuplicateGiftResult | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: source } = await admin.from("gifts").select("*").eq("manage_token", token).maybeSingle();
    if (!source) return null;
    const { data: sourceSections } = await admin.from("gift_sections").select("*").eq("gift_id", source.id);

    const sectionMap: Record<string, Record<string, unknown>> = {};
    for (const s of sourceSections ?? []) sectionMap[s.section_type] = s.data_json;
    const occasionDef = getOccasion(source.occasion);
    const amount = occasionDef ? (await calculateWizardPriceAsync(occasionDef, sectionMap)).total : 0;

    const newId = randomUUID();
    const giftToken = generateGiftToken();
    const manageToken = generateManageToken();
    const { error } = await admin.from("gifts").insert({
      id: newId,
      creator_id: source.creator_id,
      occasion: source.occasion,
      recipient_name: source.recipient_name,
      secret_pin_hash: source.secret_pin_hash,
      pin_hint: source.pin_hint,
      theme: source.theme,
      gift_wrap: source.gift_wrap,
      status: "pending_payment",
      payment_status: "pending",
      gift_token: giftToken,
      manage_token: manageToken,
      amount,
    });
    if (error) return null;

    if (sourceSections?.length) {
      await admin.from("gift_sections").insert(
        sourceSections.map((s) => ({
          gift_id: newId,
          section_type: s.section_type,
          section_order: s.section_order,
          data_json: s.data_json,
        }))
      );
    }

    return { giftId: newId, giftToken, manageToken, occasion: source.occasion, amount };
  }

  const source = getMockGiftByManageToken(token);
  if (!source) return null;
  const occasionDefForAmount = getOccasion(source.occasion);
  const recomputedAmount = occasionDefForAmount
    ? (await calculateWizardPriceAsync(occasionDefForAmount, source.sections)).total
    : source.amount;
  const duplicated = duplicateMockGift(source.id, recomputedAmount);
  if (!duplicated) return null;
  return {
    giftId: duplicated.id,
    giftToken: duplicated.giftToken,
    manageToken: duplicated.manageToken,
    occasion: duplicated.occasion,
    amount: duplicated.amount,
  };
}
