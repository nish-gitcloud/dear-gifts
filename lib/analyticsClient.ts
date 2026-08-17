/**
 * Client-side analytics helper (spec section 58). Fire-and-forget by
 * design — a failed/slow analytics call must never block or break the
 * actual creator/recipient experience, so every call swallows its own
 * errors and nothing here is awaited by callers.
 *
 * `sessionId` is optional: creator-funnel events (occasion picked, wizard
 * step reached, checkout started) fall back to a persistent
 * localStorage-backed id so a single browsing session's steps can be
 * correlated. Recipient-funnel events (stage completed, watch again) pass
 * an explicit sessionId instead — one minted server-side per gift page load
 * (see app/gift/[token]/page.tsx) so they land on the same `gift_views` row
 * that "gift opened" and PIN-attempt tracking already wrote to.
 */
function getPersistentSessionId(): string {
  const KEY = "dg_creator_session_id";
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // Storage unavailable (private browsing, etc.) — fall back to a
    // per-call id; this call just won't correlate with earlier ones.
    return crypto.randomUUID();
  }
}

export interface TrackEventProps {
  sessionId?: string;
  occasion?: string;
  giftToken?: string;
  step?: string;
  metadata?: Record<string, unknown>;
}

export function trackEvent(eventType: string, props: TrackEventProps = {}): void {
  if (typeof window === "undefined") return;
  const sessionId = props.sessionId ?? getPersistentSessionId();
  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      sessionId,
      eventType,
      occasion: props.occasion,
      giftToken: props.giftToken,
      step: props.step,
      metadata: props.metadata,
    }),
  }).catch(() => {
    // Analytics must never surface an error to the user.
  });
}
