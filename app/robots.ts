import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** Disallows every private/operational area — recipient gift pages, guest management links, dashboards, admin, and API routes must never be crawled (spec section 62). */
export default function robots(): MetadataRoute.Robots {
  const base = env.app.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/gift/", "/manage/", "/dashboard", "/admin", "/api/", "/create/", "/duplicate/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
