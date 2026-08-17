"use client";

import { useEffect, useState } from "react";

interface OccasionToggle {
  id: string;
  title: string;
  enabled: boolean;
}

/** Enable/disable occasions storefront-wide (spec section 10) — reflected immediately on /create and blocked server-side in POST /api/gifts. */
export default function AdminOccasionsPage() {
  const [occasions, setOccasions] = useState<OccasionToggle[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/occasions")
      .then((res) => res.json())
      .then((data) => setOccasions(data.occasions ?? []));
  }

  useEffect(load, []);

  async function toggle(o: OccasionToggle) {
    setPendingId(o.id);
    setOccasions((prev) => prev?.map((x) => (x.id === o.id ? { ...x, enabled: !x.enabled } : x)) ?? null);
    await fetch("/api/admin/occasions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ occasionId: o.id, enabled: !o.enabled }),
    });
    setPendingId(null);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[#241A17]">Occasions</h1>
      <p className="mt-1 text-sm text-black/50">Disabled occasions disappear from the occasion picker and can&apos;t be created directly by link.</p>

      {!occasions && <p className="mt-6 text-sm text-black/40">Loading…</p>}

      <div className="mt-6 space-y-2">
        {occasions?.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
            <span className="text-sm font-medium text-[#241A17]">{o.title}</span>
            <button
              onClick={() => toggle(o)}
              disabled={pendingId === o.id}
              className={`relative h-6 w-11 rounded-full transition-colors ${o.enabled ? "bg-emerald-500" : "bg-black/15"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  o.enabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
