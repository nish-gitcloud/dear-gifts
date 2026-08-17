"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks a press-and-hold gesture's progress (0–1) and fires `onComplete`
 * once the hold reaches `durationMs`. Shared by every "press & hold to open"
 * interaction (ring box, heart heal) so the physics feel consistent across
 * occasions (spec sections 14/16: "press-and-hold").
 */
export function useHoldProgress(durationMs: number, onComplete: () => void) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const doneRef = useRef(false);

  // Always call the latest onComplete without making `start` depend on it —
  // a parent re-render that passes a new inline callback shouldn't restart
  // an in-progress hold.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const start = useCallback(() => {
    if (doneRef.current) return;
    setHolding(true);
    startRef.current = performance.now();

    // A plain hoisted function declaration (not a useCallback value) so its
    // self-recursive requestAnimationFrame call is a completely ordinary,
    // safe JS pattern — no stale-closure risk the way a self-referencing
    // useCallback would have.
    function tick(now: number) {
      const elapsed = now - startRef.current;
      const pct = Math.min(1, elapsed / durationMs);
      setProgress(pct);
      if (pct >= 1) {
        if (!doneRef.current) {
          doneRef.current = true;
          setDone(true);
          onCompleteRef.current();
        }
        setHolding(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs]);

  const cancel = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setHolding(false);
    if (!doneRef.current) setProgress(0);
  }, []);

  return { progress, holding, start, cancel, done };
}
