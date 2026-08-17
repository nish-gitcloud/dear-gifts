import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { DEFAULT_PRICING, priceLabel, type PricingTable, type PricingCategory } from "@/config/pricing";

export interface PricingItem {
  category: string;
  itemKey: string;
  label: string;
  price: number;
  isActive: boolean;
}

declare global {
  // In-memory admin overrides for deployments without Supabase configured —
  // same "adapter" convention as lib/mockStore.ts. Keyed by `${category}:${itemKey}`.
  var __dearGiftsPricingOverrides: Map<string, { price: number; isActive: boolean }> | undefined;
}

function overridesStore() {
  if (!globalThis.__dearGiftsPricingOverrides) {
    globalThis.__dearGiftsPricingOverrides = new Map();
  }
  return globalThis.__dearGiftsPricingOverrides;
}

function defaultCatalog(): PricingItem[] {
  const items: PricingItem[] = [];
  for (const category of Object.keys(DEFAULT_PRICING) as PricingCategory[]) {
    for (const [itemKey, price] of Object.entries(DEFAULT_PRICING[category])) {
      items.push({ category, itemKey, label: priceLabel(itemKey), price, isActive: true });
    }
  }
  return items;
}

/** Full catalog with admin overrides layered on top — every default item always appears so the admin UI has something to edit even before any override exists. */
export async function listPricingItems(): Promise<PricingItem[]> {
  const catalog = defaultCatalog();

  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin.from("pricing_config").select("*");
    const overrides = new Map((data ?? []).map((row) => [`${row.category}:${row.item_key}`, row]));
    return catalog.map((item) => {
      const override = overrides.get(`${item.category}:${item.itemKey}`);
      return override ? { ...item, price: Number(override.price), isActive: override.is_active } : item;
    });
  }

  const overrides = overridesStore();
  return catalog.map((item) => {
    const override = overrides.get(`${item.category}:${item.itemKey}`);
    return override ? { ...item, ...override } : item;
  });
}

export async function upsertPricingItem(category: string, itemKey: string, price: number, isActive: boolean): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin
      .from("pricing_config")
      .upsert(
        { category, item_key: itemKey, label: priceLabel(itemKey), price, is_active: isActive, updated_at: new Date().toISOString() },
        { onConflict: "category,item_key" }
      );
    return;
  }
  overridesStore().set(`${category}:${itemKey}`, { price, isActive });
}

/**
 * Builds the effective `PricingTable` (spec section 9's admin-manageable
 * pricing) that `calculateWizardPriceAsync` charges against. Inactive items
 * resolve to price 0 rather than being omitted, so a creator who already
 * picked a since-disabled option doesn't hit an undefined lookup — new
 * selections are guarded separately wherever the option list is rendered.
 */
export async function getEffectivePricingTable(): Promise<PricingTable> {
  const items = await listPricingItems();
  const table: PricingTable = {};
  for (const item of items) {
    if (!table[item.category]) table[item.category] = {};
    table[item.category][item.itemKey] = item.isActive ? item.price : 0;
  }
  return table;
}
