"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalGifts: number;
  giftsToday: number;
  activeGifts: number;
  expiredGifts: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
  revenueToday: number;
}

const CARDS: Array<{ key: keyof Stats; label: string; format?: (n: number) => string }> = [
  { key: "totalGifts", label: "Total Gifts" },
  { key: "giftsToday", label: "Gifts Today" },
  { key: "activeGifts", label: "Active Gifts" },
  { key: "expiredGifts", label: "Expired Gifts" },
  { key: "pendingPayments", label: "Pending Payments" },
  { key: "failedPayments", label: "Failed Payments" },
  { key: "totalRevenue", label: "Total Revenue", format: (n) => `₹${n}` },
  { key: "revenueToday", label: "Revenue Today", format: (n) => `₹${n}` },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data.stats));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[#241A17]">Overview</h1>
      {!stats ? (
        <p className="mt-6 text-sm text-black/40">Loading…</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CARDS.map((card) => (
            <div key={card.key} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-black/40">{card.label}</p>
              <p className="font-display mt-2 text-2xl font-semibold text-[#241A17]">
                {card.format ? card.format(stats[card.key]) : stats[card.key]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
