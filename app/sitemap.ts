import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

const STATIC_ROUTES = ["", "/how-it-works", "/occasions", "/pricing", "/faq", "/contact", "/privacy-policy", "/terms", "/refund-policy", "/create"];

/** Public, indexable pages only — /gift/[token], /manage/[token], /dashboard, and /admin are all deliberately excluded (spec section 62: private gift URLs must never be indexed). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.app.url.replace(/\/$/, "");
  return STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
