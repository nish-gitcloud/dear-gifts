"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  giftId: string;
  occasion: string;
  recipientName: string;
  orderId: string;
  paymentId: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[#241A17]">Orders</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-black/40">
            <tr>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Occasion</th>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-black/40">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders?.map((o) => (
              <tr key={o.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-[#241A17]">{o.recipientName}</td>
                <td className="px-4 py-3 capitalize text-black/60">{o.occasion}</td>
                <td className="px-4 py-3 font-mono text-xs text-black/50">{o.orderId}</td>
                <td className="px-4 py-3 text-black/70">₹{o.amount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      o.status === "captured" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-black/40">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {orders === null && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-black/40">
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
