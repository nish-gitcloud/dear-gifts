import "server-only";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { incrementMockGiftViews } from "@/lib/mockStore";

// ---------------------------------------------------------------------------
// Creator funnel — generic events (occasion_selected, wizard_step_reached,
// preview_reached, checkout_started, payment_completed). See
// supabase/migrations/0005_analytics_events.sql for the rationale behind one
// generic table instead of one per step.
// ---------------------------------------------------------------------------

export interface AnalyticsEventInput {
  sessionId: string;
  eventType: string;
  occasion?: string;
  giftId?: string;
  step?: string;
  metadata?: Record<string, unknown>;
}

interface MockAnalyticsEvent extends AnalyticsEventInput {
  id: string;
  createdAt: string;
}

declare global {
  var __dearGiftsAnalyticsEvents: MockAnalyticsEvent[] | undefined;
}

function mockEventsLog(): MockAnalyticsEvent[] {
  if (!globalThis.__dearGiftsAnalyticsEvents) globalThis.__dearGiftsAnalyticsEvents = [];
  return globalThis.__dearGiftsAnalyticsEvents;
}

export async function recordAnalyticsEvent(input: AnalyticsEventInput): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("analytics_events").insert({
      session_id: input.sessionId,
      event_type: input.eventType,
      occasion: input.occasion ?? null,
      gift_id: input.giftId ?? null,
      step: input.step ?? null,
      metadata: input.metadata ?? {},
    });
    return;
  }
  mockEventsLog().push({ ...input, id: randomUUID(), createdAt: new Date().toISOString() });
}

export interface CreatorFunnelStats {
  occasionSelected: number;
  wizardStepReached: number;
  previewReached: number;
  checkoutStarted: number;
  paymentCompleted: number;
  byOccasion: Record<string, number>;
}

/** Counts distinct sessions per creator-funnel step (spec section 58) — a session reaching checkout without completing payment shows up as drop-off between the last two numbers. */
export async function getCreatorFunnel(): Promise<CreatorFunnelStats> {
  const admin = getSupabaseAdmin();
  const rows: Array<{ session_id: string; event_type: string; occasion: string | null }> = [];

  if (admin) {
    const { data } = await admin.from("analytics_events").select("session_id, event_type, occasion");
    rows.push(...(data ?? []));
  } else {
    rows.push(...mockEventsLog().map((e) => ({ session_id: e.sessionId, event_type: e.eventType, occasion: e.occasion ?? null })));
  }

  function distinctSessions(eventType: string): number {
    return new Set(rows.filter((r) => r.event_type === eventType).map((r) => r.session_id)).size;
  }

  const byOccasion: Record<string, number> = {};
  for (const r of rows) {
    if (r.event_type === "occasion_selected" && r.occasion) {
      byOccasion[r.occasion] = (byOccasion[r.occasion] ?? 0) + 1;
    }
  }

  return {
    occasionSelected: distinctSessions("occasion_selected"),
    wizardStepReached: distinctSessions("wizard_step_reached"),
    previewReached: distinctSessions("preview_reached"),
    checkoutStarted: distinctSessions("checkout_started"),
    paymentCompleted: distinctSessions("payment_completed"),
    byOccasion,
  };
}

// ---------------------------------------------------------------------------
// Recipient funnel — backed by the existing `gift_views` table (spec
// section 58). One row per (gift, session): started_at/gift_opened,
// pin_attempts, last_stage, completed_at.
// ---------------------------------------------------------------------------

interface MockGiftView {
  id: string;
  giftId: string;
  sessionId: string;
  startedAt: string;
  completedAt: string | null;
  lastStage: string | null;
  pinAttempts: number;
}

declare global {
  var __dearGiftsMockGiftViews: MockGiftView[] | undefined;
}

function mockGiftViews(): MockGiftView[] {
  if (!globalThis.__dearGiftsMockGiftViews) globalThis.__dearGiftsMockGiftViews = [];
  return globalThis.__dearGiftsMockGiftViews;
}

/** Called once per page load of an active gift (spec section 58: "gift opened"). Also drives the `views` count shown on /manage and /dashboard. */
export async function recordGiftOpened(giftId: string, sessionId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("gift_views").insert({ gift_id: giftId, session_id: sessionId });
    return;
  }
  incrementMockGiftViews(giftId);
  mockGiftViews().push({ id: randomUUID(), giftId, sessionId, startedAt: new Date().toISOString(), completedAt: null, lastStage: null, pinAttempts: 0 });
}

/** Records a PIN attempt against the most recent view session for this gift (spec section 58: PIN attempts per recipient session). */
export async function recordPinAttempt(giftId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: latest } = await admin
      .from("gift_views")
      .select("id, pin_attempts")
      .eq("gift_id", giftId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest) {
      await admin.from("gift_views").update({ pin_attempts: (latest.pin_attempts ?? 0) + 1 }).eq("id", latest.id);
    }
    return;
  }
  const views = mockGiftViews().filter((v) => v.giftId === giftId);
  const latest = views[views.length - 1];
  if (latest) latest.pinAttempts += 1;
}

/** Updates the furthest stage a recipient's session reached (spec section 58: stage completion / drop-off). */
export async function recordStageProgress(giftId: string, sessionId: string, stage: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin
      .from("gift_views")
      .update({ last_stage: stage })
      .eq("gift_id", giftId)
      .eq("session_id", sessionId)
      .is("completed_at", null);
    return;
  }
  const view = mockGiftViews().find((v) => v.giftId === giftId && v.sessionId === sessionId);
  if (view) view.lastStage = stage;
}

/** Marks a recipient session as having reached the end of the experience (spec section 58: completion rate). */
export async function recordGiftSessionCompleted(giftId: string, sessionId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin
      .from("gift_views")
      .update({ completed_at: new Date().toISOString() })
      .eq("gift_id", giftId)
      .eq("session_id", sessionId);
    return;
  }
  const view = mockGiftViews().find((v) => v.giftId === giftId && v.sessionId === sessionId);
  if (view) view.completedAt = new Date().toISOString();
}

export interface RecipientFunnelStats {
  totalOpens: number;
  averagePinAttempts: number;
  completionRate: number;
  stageDropOff: Array<{ stage: string; count: number }>;
}

export async function getRecipientFunnel(): Promise<RecipientFunnelStats> {
  const admin = getSupabaseAdmin();
  let views: Array<{ pin_attempts: number; last_stage: string | null; completed_at: string | null }> = [];

  if (admin) {
    const { data } = await admin.from("gift_views").select("pin_attempts, last_stage, completed_at");
    views = data ?? [];
  } else {
    views = mockGiftViews().map((v) => ({ pin_attempts: v.pinAttempts, last_stage: v.lastStage, completed_at: v.completedAt }));
  }

  const totalOpens = views.length;
  const averagePinAttempts = totalOpens ? views.reduce((sum, v) => sum + v.pin_attempts, 0) / totalOpens : 0;
  const completed = views.filter((v) => v.completed_at).length;
  const completionRate = totalOpens ? completed / totalOpens : 0;

  const stageCounts = new Map<string, number>();
  for (const v of views) {
    if (v.last_stage) stageCounts.set(v.last_stage, (stageCounts.get(v.last_stage) ?? 0) + 1);
  }

  return {
    totalOpens,
    averagePinAttempts,
    completionRate,
    stageDropOff: [...stageCounts.entries()].map(([stage, count]) => ({ stage, count })).sort((a, b) => b.count - a.count),
  };
}
