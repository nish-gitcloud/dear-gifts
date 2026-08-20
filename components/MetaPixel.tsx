"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Meta (Facebook) Pixel — base install (spec-adjacent, added post-launch
 * for ad tracking). Only mounts if NEXT_PUBLIC_META_PIXEL_ID is set
 * (lib/env.ts's `metaPixel.isConfigured`), so it's a no-op in any
 * environment (local/preview) that hasn't been given a pixel id.
 *
 * Fires the base `PageView` once on load (standard fbq init behaviour) and
 * again on every client-side route change, since Next's App Router does
 * soft navigations that the pixel's own script can't see on its own.
 *
 * Custom conversion events (InitiateCheckout, Purchase, etc.) are fired
 * from call sites via `trackMetaEvent` in lib/metaPixel.ts — see
 * app/create/[occasion]/summary/page.tsx and .../pay-manual/page.tsx.
 */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <MetaPixelRouteTracker />
      </Suspense>
    </>
  );
}

/** Re-fires PageView on every soft/client-side route change. */
function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("track", "PageView");
    // Re-fire on every path or query change so wizard-step navigation counts as a view.
  }, [pathname, searchParams]);

  return null;
}
