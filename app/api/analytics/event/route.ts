import { NextRequest, NextResponse } from "next/server";
import { recordAnalyticsEvent, recordStageProgress, recordGiftSessionCompleted } from "@/lib/analyticsRepo";
import { getGiftByToken } from "@/lib/giftRepo";

const RECIPIENT_EVENT_TYPES = new Set(["stage_completed", "gift_completed", "watch_again"]);

/**
 * Single ingestion point for every client-fired analytics event (spec
 * section 58). Recipient-funnel events carry the public `giftToken` (never
 * a DB id) — this route is the one place allowed to resolve it server-side
 * before writing to `gift_views`, same "never trust the client with an
 * internal id" convention used everywhere else in this codebase.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    sessionId?: string;
    eventType?: string;
    occasion?: string;
    giftToken?: string;
    step?: string;
    metadata?: Record<string, unknown>;
  };
  const { sessionId, eventType, occasion, giftToken, step, metadata } = body;

  if (!sessionId || !eventType) {
    return NextResponse.json({ error: "Invalid event." }, { status: 422 });
  }

  if (giftToken && RECIPIENT_EVENT_TYPES.has(eventType)) {
    const gift = await getGiftByToken(giftToken);
    if (gift) {
      if (eventType === "stage_completed" && step) {
        await recordStageProgress(gift.id, sessionId, step);
      } else if (eventType === "gift_completed") {
        await recordGiftSessionCompleted(gift.id, sessionId);
      } else if (eventType === "watch_again") {
        await recordAnalyticsEvent({ sessionId, eventType, occasion: gift.occasion, giftId: gift.id, step, metadata });
      }
    }
    return NextResponse.json({ ok: true });
  }

  await recordAnalyticsEvent({ sessionId, eventType, occasion, step, metadata });
  return NextResponse.json({ ok: true });
}
