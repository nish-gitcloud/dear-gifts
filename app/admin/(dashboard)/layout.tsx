"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/gifts", label: "Gifts" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/occasions", label: "Occasions" },
];

/**
 * Auth-gated shell for every /admin page (spec section 10). Checks the
 * signed session cookie via /api/admin/session on mount rather than in
 * middleware, keeping the admin auth story self-contained in
 * lib/adminAuth.ts + this one client check — consistent with how
 * /dashboard gates on useAuth() rather than Next middleware.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authed) {
          router.replace("/admin/login");
        } else {
          setAuthed(true);
        }
      });
  }, [router]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (authed !== true) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1A1410]">
        <p className="text-sm text-white/40">Checking access…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EF]">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="font-display text-lg font-semibold text-[#241A17]">Dear Gifts Admin</p>
          <button onClick={logout} className="text-xs text-black/40 underline">
            Log out
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 pb-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
                pathname === item.href ? "bg-[#241A17] text-white" : "text-black/55 hover:bg-black/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
