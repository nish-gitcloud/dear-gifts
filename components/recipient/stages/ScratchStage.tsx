"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { StageShell } from "../StageShell";
import { PartyPopperBurst } from "../PartyPopperBurst";

const REVEAL_THRESHOLD = 0.7; // spec section 23: auto-reveal at ~70-80%
const SAMPLE_STEP = 6; // sample every Nth pixel for perf

/** Real Canvas-based foil scratch card (spec section 23). */
export function ScratchStage({
  title,
  message,
  onContinue,
}: {
  title?: string;
  message?: string;
  onContinue: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratching = useRef(false);
  const [percent, setPercent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "#C0C0C0");
      gradient.addColorStop(0.5, "#E8E8E8");
      gradient.addColorStop(1, "#B0B0B0");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = "#8a8a8a";
      ctx.font = "600 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Scratch here ✨", rect.width / 2, rect.height / 2);
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  function scratchAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    measureScratched(ctx, canvas.width, canvas.height);
  }

  function measureScratched(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (!w || !h) return;
    const data = ctx.getImageData(0, 0, w, h).data;
    let transparent = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * SAMPLE_STEP) {
      total++;
      if (data[i] < 20) transparent++;
    }
    const pct = total ? transparent / total : 0;
    setPercent(pct);
    if (pct >= REVEAL_THRESHOLD) setRevealed(true);
  }

  return (
    <StageShell title="One Last Surprise ✨" onContinue={revealed ? onContinue : undefined} hideContinue={!revealed}>
      {revealed && <PartyPopperBurst />}
      <div className="relative mx-auto h-56 w-full max-w-xs overflow-hidden rounded-2xl bg-white shadow-inner">
        {/* This card is always a plain white surface regardless of the active
            theme (so the scratch-foil canvas below reads correctly), so its
            text must always be dark too — inheriting the theme's text color
            here previously made this unreadable on any dark theme (white
            text on a white card). */}
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-[#241A17]">
          <p className="font-display text-lg font-semibold">{title || "You uncovered it!"}</p>
          <p className="text-sm text-black/70">{message}</p>
        </div>
        {!revealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full cursor-pointer touch-none"
            onPointerDown={(e) => {
              scratching.current = true;
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (scratching.current) scratchAt(e.clientX, e.clientY);
            }}
            onPointerUp={() => (scratching.current = false)}
            onPointerLeave={() => (scratching.current = false)}
          />
        )}
      </div>
      {!revealed && (
        <p className="mt-3 text-xs opacity-50">{Math.min(100, Math.round(percent * 100))}% scratched</p>
      )}
      {revealed && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm font-medium">
          You uncovered it! 💝
        </motion.p>
      )}
    </StageShell>
  );
}
