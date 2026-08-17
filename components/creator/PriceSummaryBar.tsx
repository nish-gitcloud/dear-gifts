"use client";

/** Sticky "Current total" strip shown under the price-relevant steps (spec section 66). */
export function PriceSummaryBar({ total }: { total: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3 text-sm">
      <span className="text-black/60">Current total</span>
      <span className="font-display text-lg font-semibold text-[#241A17]">₹{total}</span>
    </div>
  );
}
