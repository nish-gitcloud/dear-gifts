"use client";

import { useEffect, useState } from "react";

/**
 * A subtle, real-phone-style status bar (time + signal/battery glyphs)
 * pinned to the top of the recipient experience, so the whole thing reads
 * like an actual phone screen rather than a plain web page. Time is only
 * ever read client-side (via an effect, updated every minute) since the
 * server has no meaningful "current time" to render without a hydration
 * mismatch.
 */
export function DeviceStatusBar() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 pt-2 text-[13px] font-semibold opacity-70"
    >
      <span>{time}</span>
      <span className="flex items-center gap-1 text-xs">
        <span>📶</span>
        <span>🔋</span>
      </span>
    </div>
  );
}
