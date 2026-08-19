/**
 * A short, human-typeable reference code derived deterministically from a
 * gift's id — shown to the creator after they pay via the static Cashfree
 * Payment Link (no per-gift API-created link, since Cashfree's
 * link-creation API isn't enabled on this account yet — see
 * app/create/[occasion]/pay-manual/page.tsx), and shown again next to each
 * pending gift in the admin dashboard so the same code can be matched by
 * eye before manually activating it.
 */
export function giftReferenceCode(giftId: string): string {
  return giftId.replace(/-/g, "").slice(0, 8).toUpperCase();
}
