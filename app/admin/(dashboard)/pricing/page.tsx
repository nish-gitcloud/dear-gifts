"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface PricingItem {
  category: string;
  itemKey: string;
  label: string;
  price: number;
  isActive: boolean;
}

/**
 * Admin pricing editor (spec section 9) — every price a creator can be
 * charged lives in one admin-managed table instead of being hardcoded into
 * the UI. Edits here take effect immediately for any gift created or
 * duplicated afterward (see lib/wizardPricingServer.ts's
 * calculateWizardPriceAsync, the only function allowed to charge a creator).
 */
export default function AdminPricingPage() {
  const [items, setItems] = useState<PricingItem[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { price: string; isActive: boolean }>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/pricing")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []));
  }

  useEffect(load, []);

  function keyFor(item: PricingItem) {
    return `${item.category}:${item.itemKey}`;
  }

  function draftFor(item: PricingItem) {
    return drafts[keyFor(item)] ?? { price: String(item.price), isActive: item.isActive };
  }

  function setDraft(item: PricingItem, patch: Partial<{ price: string; isActive: boolean }>) {
    const key = keyFor(item);
    setDrafts((prev) => ({ ...prev, [key]: { ...draftFor(item), ...patch } }));
  }

  async function save(item: PricingItem) {
    const draft = draftFor(item);
    const price = Number(draft.price);
    if (Number.isNaN(price) || price < 0) return;
    setSavingKey(keyFor(item));
    await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: item.category, itemKey: item.itemKey, price, isActive: draft.isActive }),
    });
    setSavingKey(null);
    load();
  }

  const grouped = (items ?? []).reduce<Record<string, PricingItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[#241A17]">Pricing</h1>
      <p className="mt-1 text-sm text-black/50">
        Changes apply to every new gift created or duplicated from now on. Existing paid gifts keep whatever they
        already paid.
      </p>

      {!items && <p className="mt-6 text-sm text-black/40">Loading…</p>}

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-black/40">{category}</h2>
          <div className="mt-3 space-y-2">
            {categoryItems.map((item) => {
              const draft = draftFor(item);
              const dirty = draft.price !== String(item.price) || draft.isActive !== item.isActive;
              return (
                <div key={keyFor(item)} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                  <span className="flex-1 text-sm text-[#241A17]">{item.label}</span>
                  <label className="flex items-center gap-1.5 text-xs text-black/50">
                    <input
                      type="checkbox"
                      checked={draft.isActive}
                      onChange={(e) => setDraft(item, { isActive: e.target.checked })}
                    />
                    Active
                  </label>
                  <span className="text-sm text-black/40">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={draft.price}
                    onChange={(e) => setDraft(item, { price: e.target.value })}
                    className="w-20 rounded-lg border border-black/10 px-2 py-1 text-sm outline-none focus:border-[#E85C7B]"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => save(item)}
                    disabled={!dirty || savingKey === keyFor(item)}
                  >
                    {savingKey === keyFor(item) ? "Saving…" : "Save"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
