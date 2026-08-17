import type { PriceBreakdown, PriceBreakdownLine } from "@/types/gift";

/**
 * Fallback pricing used in local/dev environments or if Supabase is
 * unreachable. In production, `services/pricing.ts` should prefer the
 * `pricing_config` table (admin-manageable, spec section 9) and fall back to
 * this file only when that read fails. Keeping the *shape* identical means
 * swapping the source never requires touching UI code.
 */
// Flat ₹199-total pricing: every theme/wrap/game/add-on resolves to 0 and
// only the base gift carries a price, so no matter what a creator picks,
// the total always comes out to exactly ₹199 — a deliberate business
// decision (not itemized upsells), not the previous per-feature pricing.
// The itemized breakdown UI still works exactly as before (each line just
// shows ₹0 except "Base Gift"); to reintroduce per-item pricing later,
// change amounts here (and in the matching Supabase seed migration) rather
// than touching any pricing *logic*.
export const DEFAULT_PRICING = {
  base: { gift: 199 },
  theme: {
    classic: 0,
    galaxy: 0,
    emerald: 0,
    frost: 0,
    midnight: 0,
    party: 0,
    "floating-hearts": 0,
    "neon-hearts": 0,
    "sparkle-hearts": 0,
    "two-hearts": 0,
    "romantic-sunset": 0,
    "starlight-love": 0,
    "classic-gold": 0,
    "galaxy-violet": 0,
    "emerald-teal": 0,
    "frost-crystal": 0,
  },
  wrap: {
    "box-classic-pink": 0,
    "box-royal-gold": 0,
    "box-mint-silver": 0,
    "box-rainbow-pop": 0,
    "envelope-classic-cream": 0,
    "envelope-rose-gold": 0,
    "envelope-midnight-navy": 0,
    "scroll-classic-parchment": 0,
    "scroll-royal-navy": 0,
    "scroll-rose-blush": 0,
    "chest-classic-oak": 0,
    "chest-dark-ebony": 0,
    "chest-royal-mahogany": 0,
  },
  game: {
    "sliding-puzzle": 0,
    "memory-match": 0,
  },
  addon: {
    "cake-classic-pink": 0,
    "cake-chocolate": 0,
    "cake-vanilla-cream": 0,
    "cake-rainbow-funfetti": 0,
    "cake-red-velvet": 0,
    "scratch-card": 0,
    "pop-wishes": 0,
    "custom-song-upload": 0,
  },
} as const;

export type PricingCategory = keyof typeof DEFAULT_PRICING;

const LABELS: Record<string, string> = {
  gift: "Base Gift",
  classic: "Classic Theme",
  galaxy: "Galaxy Theme",
  emerald: "Emerald Theme",
  frost: "Frost Theme",
  midnight: "Midnight Theme",
  party: "Party Theme",
  "floating-hearts": "Floating Hearts Theme",
  "neon-hearts": "Neon Hearts Theme",
  "sparkle-hearts": "Sparkle Hearts Theme",
  "two-hearts": "Two Hearts Theme",
  "romantic-sunset": "Romantic Sunset Theme",
  "starlight-love": "Starlight Love Theme",
  "classic-gold": "Classic Gold Theme",
  "galaxy-violet": "Galaxy Violet Theme",
  "emerald-teal": "Emerald Teal Theme",
  "frost-crystal": "Frost Crystal Theme",
  "box-classic-pink": "Classic Pink Box",
  "box-royal-gold": "Royal Gold Box",
  "box-mint-silver": "Mint & Silver Box",
  "box-rainbow-pop": "Rainbow Pop Box",
  "envelope-classic-cream": "Classic Cream Envelope",
  "envelope-rose-gold": "Rose Gold Envelope",
  "envelope-midnight-navy": "Midnight Navy Envelope",
  "scroll-classic-parchment": "Classic Parchment Scroll",
  "scroll-royal-navy": "Royal Navy Scroll",
  "scroll-rose-blush": "Rose Blush Scroll",
  "chest-classic-oak": "Classic Oak Chest",
  "chest-dark-ebony": "Dark Ebony Chest",
  "chest-royal-mahogany": "Royal Mahogany Chest",
  "sliding-puzzle": "Sliding Puzzle",
  "memory-match": "Memory Match",
  "cake-classic-pink": "Classic Pink Cake",
  "cake-chocolate": "Chocolate Cake",
  "cake-vanilla-cream": "Vanilla Cream Cake",
  "cake-rainbow-funfetti": "Rainbow Funfetti Cake",
  "cake-red-velvet": "Red Velvet Cake",
  "scratch-card": "One Last Surprise",
  "pop-wishes": "Pop the Wishes",
  "custom-song-upload": "Custom Song Upload",
};

export function priceLabel(key: string): string {
  return LABELS[key] ?? key;
}

/** Same shape as DEFAULT_PRICING — lets admin-managed overrides (lib/pricingRepo.ts) fully replace it at runtime. */
export type PricingTable = Record<string, Record<string, number>>;

export function priceFor(category: PricingCategory, key: string, table: PricingTable = DEFAULT_PRICING): number {
  const categoryTable = table[category];
  return categoryTable?.[key] ?? 0;
}

/**
 * Builds a full, itemized price breakdown from a wizard's current selections.
 * `selections` maps a pricing category to the chosen item_key(s) — most
 * categories have a single selection, but add-ons can be a list.
 *
 * `table` defaults to the static DEFAULT_PRICING fallback but is meant to be
 * the admin-managed, DB-backed table from `lib/pricingRepo.ts` wherever an
 * authoritative (charged) amount is being computed — see
 * `lib/wizardPricing.ts`'s `calculateWizardPriceAsync` (spec section 9: "do
 * not hardcode prices").
 */
export function calculatePrice(
  selections: {
    theme?: string;
    wrap?: string;
    game?: string;
    addons?: string[];
  },
  table: PricingTable = DEFAULT_PRICING
): PriceBreakdown {
  const lines: PriceBreakdownLine[] = [
    { label: priceLabel("gift"), amount: priceFor("base", "gift", table) },
  ];

  if (selections.theme) {
    const amount = priceFor("theme", selections.theme, table);
    lines.push({ label: priceLabel(selections.theme), amount });
  }
  if (selections.wrap) {
    const amount = priceFor("wrap", selections.wrap, table);
    lines.push({ label: priceLabel(selections.wrap), amount });
  }
  if (selections.game) {
    const amount = priceFor("game", selections.game, table);
    lines.push({ label: priceLabel(selections.game), amount });
  }
  for (const addon of selections.addons ?? []) {
    const amount = priceFor("addon", addon, table);
    lines.push({ label: priceLabel(addon), amount });
  }

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, total };
}
