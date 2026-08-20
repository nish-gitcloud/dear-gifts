/**
 * Fire a Meta Pixel standard/custom event from any client component (e.g.
 * "InitiateCheckout" when Publish/Pay is clicked). Safe to call even when
 * the pixel isn't configured or hasn't loaded yet — `window.fbq` is only
 * ever defined once components/MetaPixel.tsx has mounted its script.
 */
export function trackMetaEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  fbq?.("track", eventName, params);
}
