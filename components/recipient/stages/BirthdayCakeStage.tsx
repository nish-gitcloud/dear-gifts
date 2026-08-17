"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { StageShell } from "../StageShell";
import { PartyPopperBurst } from "../PartyPopperBurst";
import { CakeCandles } from "../CakeCandles";
import { calculateDurationSince, type DurationBreakdown } from "@/lib/age";

const UNITS: { key: keyof DurationBreakdown; label: string }[] = [
  { key: "years", label: "Years" },
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
];

const CANDLE_COUNT = 5;

/**
 * Birthday reveal + cake, merged into a single stage: name, countdown, and
 * the candle-blow interaction all appear together (rather than the cake
 * living on a separate next screen), matching the reference design where
 * the whole "Happy Birthday" moment reads as one continuous beat.
 */
export function BirthdayCakeStage({
  name,
  birthDate,
  cakeId,
  onContinue,
}: {
  name: string;
  birthDate: string;
  cakeId?: string;
  onContinue: () => void;
}) {
  const [duration] = useState<DurationBreakdown | null>(() => (birthDate ? calculateDurationSince(birthDate) : null));

  const [litCandles, setLitCandles] = useState(CANDLE_COUNT);
  const [listening, setListening] = useState(false);
  const [madeWish, setMadeWish] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const allOut = litCandles === 0;

  // A single tap blows out every remaining candle at once — no need to tap
  // once per candle. Blowing via the microphone still fades them out one at
  // a time (below), since that's meant to simulate a continuous breath.
  function blowOutAll() {
    setLitCandles(0);
  }

  function blowOutOne() {
    setLitCandles((c) => Math.max(0, c - 1));
  }

  async function startMicBlow() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      setListening(true);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const volume = data.reduce((a, b) => a + b, 0) / data.length;
        if (volume > 40) blowOutOne();
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setListening(false);
    }
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  return (
    <StageShell
      title={`Happy Birthday ${name}`}
      subtitle="The World Has Been Better Since ❤️"
      onContinue={allOut ? onContinue : undefined}
      hideContinue={!allOut}
    >
      {duration && (
        <div className="grid grid-cols-4 gap-2">
          {UNITS.map((u, i) => (
            <motion.div
              key={u.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="rounded-2xl bg-black/5 px-2 py-3"
            >
              <p className="font-display text-lg font-semibold sm:text-xl">{duration[u.key].toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-wide opacity-60">{u.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col items-center">
        <p className="mb-3 text-sm font-medium opacity-80">
          {allOut ? "Make a wish… 🌠" : "Tap the cake to blow the candles"}
        </p>
        <div className="relative">
          {allOut && <PartyPopperBurst />}
          <CakeCandles cakeId={cakeId} litCount={litCandles} total={CANDLE_COUNT} onTap={blowOutAll} />
        </div>

        {!allOut && !listening && (
          <button onClick={startMicBlow} className="mt-6 text-xs underline opacity-60">
            Or blow with your breath
          </button>
        )}
        {!allOut && <p className="mt-4 text-xs opacity-50">Blow out the candles to continue ✨</p>}
        {allOut && !madeWish && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <button onClick={() => setMadeWish(true)} className="text-sm underline opacity-70">
              I made a wish 🌠
            </button>
          </motion.div>
        )}
      </div>
    </StageShell>
  );
}
