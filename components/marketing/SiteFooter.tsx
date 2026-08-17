import Link from "next/link";

const COLUMNS: Array<{ title: string; icon: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: "Product",
    icon: "🎁",
    links: [
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/occasions", label: "Occasions" },
      { href: "/pricing", label: "Pricing" },
      { href: "/create", label: "Create a Gift" },
    ],
  },
  {
    title: "Support",
    icon: "💬",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact Us" },
      { href: "/dashboard", label: "My Gifts" },
    ],
  },
  {
    title: "Legal",
    icon: "📄",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/refund-policy", label: "Refund Policy" },
    ],
  },
];

/** Short, shared marketing-site footer. Follows the OS light/dark preference automatically. */
export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white px-6 py-14 dark:border-white/10 dark:bg-[#150F15]">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-4">
          <div>
            <p className="font-display flex items-center gap-1.5 text-lg font-semibold text-[#241A17] dark:text-[#F3ECE8]">
              <span aria-hidden>🎁</span> Dear Gifts
            </p>
            <p className="mt-2 max-w-xs text-sm text-black/55 dark:text-white/50">
              Turn your memories, wishes and feelings into an unforgettable digital surprise.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">
                <span aria-hidden>{col.icon}</span> {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-black/60 hover:text-[#241A17] dark:text-white/55 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 text-xs text-black/35 dark:text-white/30">
          © {new Date().getFullYear()} Dear Gifts. Made with 💛.
        </p>
      </div>
    </footer>
  );
}
