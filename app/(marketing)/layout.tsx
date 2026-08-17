import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

/**
 * Shared chrome for the homepage + every informational/SEO page (spec
 * section 18's marketing pages). Deliberately scoped to this route group
 * only — the creator wizard, recipient experience, and admin dashboard stay
 * full-screen and distraction-free, with no site nav competing for attention.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
