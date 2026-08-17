import type { Metadata } from "next";
import Link from "next/link";
import { listPricingItems } from "@/lib/pricingRepo";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Pricing — Dear Gifts",
  description: "Transparent, itemized pricing for every Dear Gifts surprise — base gift, themes, gift wraps, games, and add-ons.",
};

const CATEGORY_LABEL: Record<string, string> = {
  base: "Base Gift",
  theme: "Themes",
  wrap: "Gift Wraps",
  game: "Interactive Games",
  addon: "Add-ons",
};

const CATEGORY_ORDER = ["base", "theme", "wrap", "game", "addon"];

/**
 * Pulled live from the same admin-managed pricing table that actually
 * charges creators (lib/pricingRepo.ts) — never a hardcoded marketing copy
 * of prices that could drift from what checkout actually charges (spec
 * section 45).
 */
export default async function PricingPage() {
  const items = (await listPricingItems()).filter((i) => i.isActive);
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABEL[category] ?? category,
    items: items.filter((i) => i.category === category),
  })).filter((g) => g.items.length > 0);

  const basePrice = items.find((i) => i.category === "base" && i.itemKey === "gift")?.price ?? 49;

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">Pricing</p>
      <h1 className="font-display mt-3 max-w-2xl text-3xl font-semibold text-[#241A17] sm:text-5xl">
        Starts at ₹{basePrice}. Fully itemized, no surprises.
      </h1>
      <p className="mt-4 max-w-2xl text-base text-black/60">
        Every gift starts with the base experience — pick a free theme and wrap and you&apos;re done. Add a
        premium theme, wrap, game, or extra like a scratch card, and the price updates instantly so you always know
        exactly what you&apos;re paying for.
      </p>

      <div className="mt-14 space-y-10">
        {grouped.map((group) => (
          <div key={group.category}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-black/40">{group.label}</h2>
            <div className="mt-3 divide-y divide-black/5 rounded-2xl bg-white shadow-sm">
              {group.items.map((item) => (
                <div key={`${item.category}:${item.itemKey}`} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-black/70">{item.label}</span>
                  <span className="font-medium text-[#241A17]">{item.price === 0 ? "Free" : `₹${item.price}`}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-white p-8 text-center shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-[#241A17]">See your exact total before you pay</h2>
        <p className="mt-2 text-sm text-black/55">
          The wizard shows a running price as you build, and nothing is charged until you confirm at checkout.
        </p>
        <div className="mt-6">
          <Link href="/create">
            <Button size="lg">Start Creating</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
