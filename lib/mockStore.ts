import "server-only";
import { randomUUID } from "crypto";
import type { GiftRecord, OccasionId } from "@/types/gift";
import type { PinAttemptState } from "@/lib/pin";
import { generateGiftToken, generateManageToken } from "@/lib/token";

/**
 * In-memory fallback "database" used only when Supabase isn't configured
 * (Phase 1 placeholder mode — see lib/env.ts). Lets the full create → pay →
 * verify → gift-link pipeline be exercised end-to-end locally before real
 * infrastructure exists. Resets whenever the dev server restarts; never
 * used when `env.supabase.isConfigured` is true.
 */
export interface MockGift extends GiftRecord {
  sections: Record<string, Record<string, unknown>>;
  secretPinHash: string;
  pinFailedAttempts: number;
  pinLockedUntil: string | null;
  manageToken: string;
  views: number;
}

export interface MockPayment {
  id: string;
  giftId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  status: "captured" | "failed";
  createdAt: string;
}

declare global {
  var __dearGiftsMockStore: Map<string, MockGift> | undefined;
  var __dearGiftsMockEdits: Array<{ giftId: string; field: string; oldValue: string; newValue: string; createdAt: string }> | undefined;
  var __dearGiftsMockPayments: MockPayment[] | undefined;
}

function store(): Map<string, MockGift> {
  if (!globalThis.__dearGiftsMockStore) {
    globalThis.__dearGiftsMockStore = new Map();
  }
  return globalThis.__dearGiftsMockStore;
}

function editsLog() {
  if (!globalThis.__dearGiftsMockEdits) {
    globalThis.__dearGiftsMockEdits = [];
  }
  return globalThis.__dearGiftsMockEdits;
}

function paymentsLog(): MockPayment[] {
  if (!globalThis.__dearGiftsMockPayments) {
    globalThis.__dearGiftsMockPayments = [];
  }
  return globalThis.__dearGiftsMockPayments;
}

/** Records a captured/failed payment attempt for admin reporting (spec section 10's Orders table). */
export function recordMockPayment(input: { giftId: string; orderId: string; paymentId: string; amount: number; status: "captured" | "failed" }): void {
  paymentsLog().push({ id: randomUUID(), ...input, createdAt: new Date().toISOString() });
}

export function listMockPayments(): MockPayment[] {
  return [...paymentsLog()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createMockGift(input: {
  id: string;
  creatorId?: string | null;
  occasion: OccasionId;
  recipientName: string;
  pinHint: string | null;
  secretPinHash: string;
  theme: string;
  giftWrap: string;
  giftToken: string;
  manageToken?: string;
  amount: number;
  sections: Record<string, Record<string, unknown>>;
}): MockGift {
  const gift: MockGift = {
    id: input.id,
    creatorId: input.creatorId ?? null,
    occasion: input.occasion,
    recipientName: input.recipientName,
    recipientPhone: null,
    pinHint: input.pinHint,
    secretPinHash: input.secretPinHash,
    pinFailedAttempts: 0,
    pinLockedUntil: null,
    theme: input.theme,
    giftWrap: input.giftWrap,
    status: "pending_payment",
    paymentStatus: "pending",
    paymentId: null,
    giftToken: input.giftToken,
    manageToken: input.manageToken ?? generateManageToken(),
    amount: input.amount,
    createdAt: new Date().toISOString(),
    expiresAt: null,
    completedAt: null,
    sections: input.sections,
    views: 0,
  };
  store().set(gift.id, gift);
  return gift;
}

/** All gifts, newest first — admin-only (spec section 10's Gifts table); never used for a customer-facing listing. */
export function listAllMockGifts(): MockGift[] {
  return Array.from(store().values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMockGiftById(id: string): MockGift | undefined {
  return store().get(id);
}

export function getMockGiftByToken(token: string): MockGift | undefined {
  for (const gift of store().values()) {
    if (gift.giftToken === token) return gift;
  }
  return undefined;
}

export function getMockGiftByManageToken(token: string): MockGift | undefined {
  for (const gift of store().values()) {
    if (gift.manageToken === token) return gift;
  }
  return undefined;
}

export function getMockGiftsByCreator(creatorId: string): MockGift[] {
  return Array.from(store().values())
    .filter((g) => g.creatorId === creatorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function activateMockGift(id: string, expiryDays: number): MockGift | undefined {
  const gift = store().get(id);
  if (!gift) return undefined;
  gift.status = "active";
  gift.paymentStatus = "paid";
  gift.completedAt = new Date().toISOString();
  gift.expiresAt = new Date(Date.now() + expiryDays * 86_400_000).toISOString();
  store().set(id, gift);
  return gift;
}

export function getMockPinAttemptState(giftId: string): PinAttemptState {
  const gift = store().get(giftId);
  return { failedAttempts: gift?.pinFailedAttempts ?? 0, lockedUntil: gift?.pinLockedUntil ?? null };
}

export function setMockPinAttemptState(giftId: string, state: PinAttemptState): void {
  const gift = store().get(giftId);
  if (!gift) return;
  gift.pinFailedAttempts = state.failedAttempts;
  gift.pinLockedUntil = state.lockedUntil;
  store().set(giftId, gift);
}

export function incrementMockGiftViews(id: string): void {
  const gift = store().get(id);
  if (!gift) return;
  gift.views += 1;
  store().set(id, gift);
}

/** Applies a whitelisted edit to one section/field and appends an audit row (spec section 6). */
export function applyMockGiftEdit(giftId: string, sectionId: string, fieldId: string, newValue: unknown): boolean {
  const gift = store().get(giftId);
  if (!gift) return false;
  const section = { ...(gift.sections[sectionId] ?? {}) };
  const oldValue = section[fieldId];
  section[fieldId] = newValue;
  gift.sections = { ...gift.sections, [sectionId]: section };
  store().set(giftId, gift);
  editsLog().push({
    giftId,
    field: `${sectionId}.${fieldId}`,
    oldValue: JSON.stringify(oldValue ?? null),
    newValue: JSON.stringify(newValue),
    createdAt: new Date().toISOString(),
  });
  return true;
}

/**
 * Duplicates a gift's content into a fresh draft — a new payment is
 * required to activate it (spec section 6). `amountOverride` lets the
 * caller (lib/giftRepo.ts) pass a freshly-recomputed price that reflects
 * current admin pricing rather than the original gift's possibly-stale
 * stored amount.
 */
export function duplicateMockGift(sourceId: string, amountOverride?: number): MockGift | undefined {
  const source = store().get(sourceId);
  if (!source) return undefined;
  const id = randomUUID();
  const gift: MockGift = {
    ...source,
    id,
    status: "pending_payment",
    paymentStatus: "pending",
    paymentId: null,
    giftToken: generateGiftToken(),
    manageToken: generateManageToken(),
    amount: amountOverride ?? source.amount,
    createdAt: new Date().toISOString(),
    expiresAt: null,
    completedAt: null,
    pinFailedAttempts: 0,
    pinLockedUntil: null,
    views: 0,
    sections: { ...source.sections },
  };
  store().set(id, gift);
  return gift;
}
