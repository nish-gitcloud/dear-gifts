import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { OCCASIONS, getEnabledOccasions } from "@/config/occasions";
import type { OccasionDefinition, OccasionId } from "@/types/gift";

declare global {
  // Admin occasion enable/disable overrides for deployments without Supabase
  // configured (spec section 10) — same in-memory adapter convention used
  // throughout this codebase (lib/mockStore.ts, lib/pricingRepo.ts).
  var __dearGiftsOccasionOverrides: Map<OccasionId, boolean> | undefined;
}

function overridesStore() {
  if (!globalThis.__dearGiftsOccasionOverrides) {
    globalThis.__dearGiftsOccasionOverrides = new Map();
  }
  return globalThis.__dearGiftsOccasionOverrides;
}

export interface OccasionToggle {
  id: OccasionId;
  title: string;
  enabled: boolean;
}

/** Every occasion with its *effective* enabled state — static config default, overridden by whatever an admin has toggled. */
export async function listOccasionToggles(): Promise<OccasionToggle[]> {
  const admin = getSupabaseAdmin();
  let overrides = new Map<string, boolean>();
  if (admin) {
    const { data } = await admin.from("occasion_settings").select("*");
    overrides = new Map((data ?? []).map((row) => [row.occasion, row.enabled]));
  } else {
    overrides = overridesStore();
  }
  return OCCASIONS.map((o) => ({
    id: o.id,
    title: o.title,
    enabled: overrides.has(o.id) ? Boolean(overrides.get(o.id)) : o.enabled,
  }));
}

export async function setOccasionEnabled(occasionId: OccasionId, enabled: boolean): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("occasion_settings").upsert(
      { occasion: occasionId, enabled, updated_at: new Date().toISOString() },
      { onConflict: "occasion" }
    );
    return;
  }
  overridesStore().set(occasionId, enabled);
}

/** The list creators actually see/can create from — config default, admin-overridden (spec section 10: "enable/disable occasions"). */
export async function getEffectiveEnabledOccasions(): Promise<OccasionDefinition[]> {
  const toggles = await listOccasionToggles();
  const enabledIds = new Set(toggles.filter((t) => t.enabled).map((t) => t.id));
  return getEnabledOccasions().filter((o) => enabledIds.has(o.id));
}

export async function isOccasionEnabledEffective(occasionId: string): Promise<boolean> {
  const toggles = await listOccasionToggles();
  const toggle = toggles.find((t) => t.id === occasionId);
  return Boolean(toggle?.enabled);
}
