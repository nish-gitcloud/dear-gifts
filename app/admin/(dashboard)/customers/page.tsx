"use client";

import { useEffect, useState } from "react";

interface Customer {
  id: string;
  email: string | null;
  giftCount: number;
  totalSpend: number;
  lastActivity: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers ?? []));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[#241A17]">Customers</h1>
      <p className="mt-1 text-sm text-black/50">
        Signed-in creators are grouped by account; guest checkouts (no account) are combined into one row since
        there&apos;s no identity to group them by.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-black/40">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Gifts</th>
              <th className="px-4 py-3">Total Spend</th>
              <th className="px-4 py-3">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {customers?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-black/40">
                  No customers yet.
                </td>
              </tr>
            )}
            {customers?.map((c) => (
              <tr key={c.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-[#241A17]">
                  {c.id === "guest" ? "Guest checkouts" : c.email ?? c.id}
                </td>
                <td className="px-4 py-3 text-black/60">{c.giftCount}</td>
                <td className="px-4 py-3 text-black/70">₹{c.totalSpend}</td>
                <td className="px-4 py-3 text-xs text-black/40">
                  {c.lastActivity ? new Date(c.lastActivity).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {customers === null && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-black/40">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
