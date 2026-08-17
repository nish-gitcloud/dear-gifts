"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { StageShell } from "../StageShell";
import { PartyPopperBurst } from "../PartyPopperBurst";
import { CakeCandles } from "../CakeCandles";

const CANDLE_COUNT = 5;

/**
 * Tap-to-blow (and optional microphone-blow) candle interaction (spec
 * section 38). Microphone access is fully optional and gracefully falls
 * back to tap — we never block the experience on a permission prompt.
 */
export function CakeStage({ cakeId, onContinue }: { cakeId?: string; onContinue: () => void }) {
  const [litCandles, setLitCandles] = useState(CANDLE_COUNT);
  const [listening, setListening] = useState(false);
  const [madeWish, setMadeWish] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const allOut = litCandles === 0;

  // A single tap blows out every remaining candle at once; the microphone
  // path still fades them one at a time to simulate a continuous breath.
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
      // Permission denied or unsupported — tap fallback remains available.
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
      title={allOut ? "Make a wish… 🌠" : "Tap the cake to blow the candles"}
      onContinue={allOut ? onContinue : undefined}
      hideContinue={!allOut}
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          {allOut && <PartyPopperBurst />}
          <CakeCandles cakeId={cakeId} litCount={litCandles} total={CANDLE_COUNT} onTap={blowOutAll} />
        </div>

        {!allOut && !listening && (
          <button onClick={startMicBlow} className="mt-6 text-xs underline opacity-60">
            Or blow with your breath
          </button>
        )}
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
