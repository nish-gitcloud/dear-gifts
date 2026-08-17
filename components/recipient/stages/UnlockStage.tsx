"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PartyPopperBurst } from "../PartyPopperBurst";
import { WrapIllustration, WRAP_COLORS, FALLBACK_WRAP_PALETTE } from "@/components/creator/fields/WrapPickerField";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

/** A short, bright ascending chime — plays the instant the gift is tapped open. */
function playRevealChime() {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const now = ctx.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.09;
    const end = start + 0.5;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.22, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, end);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  });
  window.setTimeout(() => ctx.close().catch(() => {}), 900);
}

/**
 * First screen the recipient ever sees (spec sections 35–36). Tapping the
 * gift plays a short "3D" reveal — a glowing platform, a burst of
 * hearts/sparkles, and a bright chime — before a phone-lock-style numeric
 * keypad PIN gate appears, auto-submitting once the 4th digit is entered.
 *
 * Two verification modes:
 * - `onVerifyPin`: async, calls the server (used on the real /gift/[token]
 *   page — the PIN hash never reaches the client, per spec section 36).
 * - `expectedPin`: plain client-side compare, used ONLY in Preview Mode
 *   where there is no persisted gift/PIN hash to check against yet.
 */
export function UnlockStage({
  wrapId,
  wrapCategory = "box",
  pinHint,
  expectedPin,
  onVerifyPin,
  onUnlocked,
}: {
  /** The specific wrap option chosen in the wizard (e.g. "box-royal-gold") — used to render the exact colored illustration, not just a generic per-category emoji. */
  wrapId?: string;
  wrapCategory?: string;
  pinHint?: string;
  expectedPin?: string;
  onVerifyPin?: (pin: string) => Promise<{ valid: boolean; locked: boolean; message?: string }>;
  onUnlocked: () => void;
}) {
  const wrapPalette = WRAP_COLORS[wrapId ?? ""] ?? FALLBACK_WRAP_PALETTE;
  const [opened, setOpened] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const revealTimeoutRef = useRef<number | null>(null);

  async function submit(fullPin: string) {
    if (fullPin.length !== 4 || locked || checking) return;

    if (onVerifyPin) {
      setChecking(true);
      const result = await onVerifyPin(fullPin);
      setChecking(false);
      if (result.valid) {
        onUnlocked();
        return;
      }
      setPin("");
      setError(result.message ?? "That code doesn't seem right. Try again.");
      setShake(true);
      if (result.locked) setLocked(true);
      return;
    }

    if (!expectedPin || fullPin === expectedPin) {
      onUnlocked();
      return;
    }
    const next = attempts + 1;
    setAttempts(next);
    setPin("");
    setShake(true);
    if (next >= 5) {
      setLocked(true);
      setError("Too many attempts. Try again in a few minutes.");
    } else {
      setError("That code doesn't seem right. Try again.");
    }
  }

  useEffect(() => {
    if (!shake) return;
    const t = window.setTimeout(() => setShake(false), 420);
    return () => window.clearTimeout(t);
  }, [shake]);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) window.clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  function tapOpen() {
    if (revealing || opened) return;
    playRevealChime();
    setRevealing(true);
    revealTimeoutRef.current = window.setTimeout(() => {
      setOpened(true);
      setRevealing(false);
    }, 750);
  }

  function press(key: string) {
    if (locked || checking) return;
    setError(null);
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (key === "" || pin.length >= 4) return;
    const next = (pin + key).slice(0, 4);
    setPin(next);
    if (next.length === 4) submit(next);
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-16 text-center">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="closed" exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center">
            <p className="text-sm uppercase tracking-[0.3em] opacity-60">A surprise awaits you...</p>
            <p className="mt-2 max-w-xs text-sm opacity-70">Something special, just for you.</p>

            <div className="relative mt-10 flex h-40 w-40 items-center justify-center" style={{ perspective: 800 }}>
              {/* A glowing "platform" behind the gift — layered radial gradient +
                  blur gives the flat emoji a sense of dimension/light source. */}
              <div
                aria-hidden
                className="absolute h-32 w-32 rounded-full opacity-70 blur-2xl"
                style={{ background: "radial-gradient(circle, var(--dg-primary,#E85C7B) 0%, transparent 70%)" }}
              />
              <motion.button
                onClick={tapOpen}
                whileTap={{ scale: 0.88, rotateY: -12 }}
                animate={
                  revealing
                    ? { scale: [1, 1.2, 0.3, 0], rotateX: [0, -18, 30, 60], rotateY: [0, 20, -30, 0], rotateZ: [0, -8, 8, 0] }
                    : { y: [0, -8, 0], rotateY: [0, 8, -8, 0] }
                }
                transition={
                  revealing
                    ? { duration: 0.75, ease: "easeIn" }
                    : {
                        y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                        rotateY: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
                      }
                }
                style={{ filter: "drop-shadow(0 18px 20px rgba(0,0,0,0.35))", transformStyle: "preserve-3d" }}
                className="touch-target relative flex items-center justify-center"
                aria-label="Tap the clasp to unlock"
              >
                {/* The exact wrap the creator picked (color + shape), not a
                    flat per-category emoji — every "box" option used to look
                    identical here regardless of which specific one (Classic
                    Pink, Royal Gold, ...) was actually selected. */}
                <div style={{ transform: "scale(2.6)" }}>
                  <WrapIllustration category={wrapCategory} palette={wrapPalette} />
                </div>
              </motion.button>
            </div>

            {/* The reveal burst is a full-page overlay (not confined to this
                small 160px box) so the love emojis genuinely fill the whole
                screen, not just a ring around the gift icon. */}
            {revealing && <PartyPopperBurst count={30} />}

            <p className="mt-8 text-xs opacity-50">Tap the clasp to unlock.</p>
          </motion.div>
        ) : (
          <motion.div
            key="pin"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex w-full max-w-[280px] flex-col items-center rounded-[2rem] border border-current/10 bg-black/[0.03] px-6 py-8 shadow-sm"
          >
            <p className="text-2xl">🔒</p>
            <h2 className="font-display mt-3 text-lg font-semibold">Enter the secret code</h2>
            {pinHint && <p className="mt-1 text-xs opacity-60">Hint: {pinHint}</p>}

            <motion.div
              animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="mt-5 flex items-center gap-3"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-3 w-3 rounded-full border-2 border-current/40 transition-all",
                    i < pin.length && "scale-110 border-[var(--dg-primary,#E85C7B)] bg-[var(--dg-primary,#E85C7B)]"
                  )}
                />
              ))}
            </motion.div>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
            {checking && <p className="mt-3 text-xs opacity-60">Checking...</p>}

            <div className="mt-6 grid grid-cols-3 gap-3">
              {KEYS.map((key, i) =>
                key === "" ? (
                  <span key={`spacer-${i}`} />
                ) : (
                  <button
                    key={key}
                    type="button"
                    onClick={() => press(key)}
                    disabled={locked || checking}
                    aria-label={key === "⌫" ? "Delete digit" : `Digit ${key}`}
                    className="touch-target flex h-14 w-14 items-center justify-center rounded-full bg-black/5 text-lg font-semibold transition hover:bg-black/10 active:scale-95 disabled:opacity-40"
                  >
                    {key}
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
