import "server-only";
import type { OccasionDefinition } from "@/types/gift";
import { calculatePrice } from "@/config/pricing";
import { priceSelectionsFromWizard } from "@/lib/wizardPricing";
import { getEffectivePricingTable } from "@/lib/pricingRepo";

/**
 * The AUTHORITATIVE price — reads the admin-managed pricing table (spec
 * section 9) instead of the static config/pricing.ts fallback. Every place
 * that actually charges a creator (gift creation, duplication) must use
 * this, not `calculateWizardPrice` from lib/wizardPricing.ts, which stays
 * synchronous and client-safe purely so wizard/summary screens can render a
 * live estimate while the form is filled in. Kept in its own server-only
 * module (rather than added to wizardPricing.ts) so that estimate-only
 * import path never pulls in Supabase/server code into the client bundle.
 */
export async function calculateWizardPriceAsync(
  occasion: OccasionDefinition,
  values: Record<string, Record<string, unknown>>
) {
  const table = await getEffectivePricingTable();
  return calculatePrice(priceSelectionsFromWizard(occasion, values), table);
}
