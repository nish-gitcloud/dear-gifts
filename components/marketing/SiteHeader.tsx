"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/occasions", label: "Occasions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

/** Shared marketing-site header — homepage + all informational pages, never the wizard/recipient/admin screens, which stay full-screen and distraction-free. Follows the OS light/dark preference automatically. */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[#FFFAF7]/90 backdrop-blur-sm dark:border-white/10 dark:bg-[#100B10]/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display flex items-center gap-1.5 text-lg font-semibold text-[#241A17] dark:text-[#F3ECE8]">
          <span aria-hidden>🎁</span> Dear Gifts
        </Link>
        <nav className="hidden items-center gap-6 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-black/60 hover:text-[#241A17] dark:text-white/60 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/create" className="hidden sm:block">
            <Button>✨ Create a Gift</Button>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="touch-target flex items-center justify-center rounded-full text-xl text-[#241A17] sm:hidden dark:text-[#F3ECE8]"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-black/5 bg-[#FFFAF7] px-6 py-4 sm:hidden dark:border-white/10 dark:bg-[#100B10]">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/create" onClick={() => setMenuOpen(false)} className="mt-2">
            <Button className="w-full">✨ Create a Gift</Button>
          </Link>
        </nav>
      )}
    </header>
  );
}
