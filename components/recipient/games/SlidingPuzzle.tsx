"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const GRID = 3; // predefined difficulty (spec section 21 — system decides, not the creator)

function shuffledTiles(): number[] {
  // 0 represents the blank tile.
  const tiles = Array.from({ length: GRID * GRID }, (_, i) => i);
  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (!isSolvable(tiles) || isSolved(tiles));
  return tiles;
}

function solvedTiles(): number[] {
  const tiles = Array.from({ length: GRID * GRID }, (_, i) => i + 1);
  tiles[tiles.length - 1] = 0;
  return tiles;
}

function isSolvable(tiles: number[]): boolean {
  const flat = tiles.filter((t) => t !== 0);
  let inversions = 0;
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

function isSolved(tiles: number[]): boolean {
  return tiles.every((t, i) => (i === tiles.length - 1 ? t === 0 : t === i + 1));
}

/**
 * Sliding tile puzzle (spec sections 21/40). Falls back to plain numbered
 * tiles — never a blank/invisible square — whenever `image` is missing or
 * fails to actually load, and gives the recipient a "Shuffle Again" restart
 * and a "Solve it for me" escape hatch alongside a live moves counter.
 */
export function SlidingPuzzle({ image, onSolved }: { image?: string; onSolved: () => void }) {
  const [tiles, setTiles] = useState<number[]>(() => shuffledTiles());
  const [moves, setMoves] = useState(0);
  const [imageOk, setImageOk] = useState(false);
  const solved = useMemo(() => isSolved(tiles), [tiles]);

  useEffect(() => {
    if (!image) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets a load-probe result when the `image` prop itself goes away, not derivable during render.
      setImageOk(false);
      return;
    }
    let cancelled = false;
    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled) setImageOk(true);
    };
    probe.onerror = () => {
      if (!cancelled) setImageOk(false);
    };
    probe.src = image;
    return () => {
      cancelled = true;
    };
  }, [image]);

  useEffect(() => {
    if (solved) onSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  function tap(idx: number) {
    const blank = tiles.indexOf(0);
    const [br, bc] = [Math.floor(blank / GRID), blank % GRID];
    const [r, c] = [Math.floor(idx / GRID), idx % GRID];
    const adjacent = (Math.abs(br - r) === 1 && bc === c) || (Math.abs(bc - c) === 1 && br === r);
    if (!adjacent) return;
    const next = [...tiles];
    [next[idx], next[blank]] = [next[blank], next[idx]];
    setTiles(next);
    setMoves((m) => m + 1);
  }

  function shuffleAgain() {
    setTiles(shuffledTiles());
    setMoves(0);
  }

  function solveForMe() {
    setTiles(solvedTiles());
  }

  const usableImage = imageOk ? image : undefined;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-black/5 px-4 py-2 text-center">
          <p className="font-display text-lg font-semibold">{moves}</p>
          <p className="text-[9px] uppercase tracking-wide opacity-60">Moves</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-11 w-11 overflow-hidden rounded-lg bg-black/5">
            {usableImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={usableImage} alt="Reference" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg">🧩</div>
            )}
          </div>
          <p className="text-[9px] uppercase tracking-wide opacity-60">Picture</p>
        </div>
      </div>

      <div
        className="mx-auto grid touch-none gap-1 rounded-2xl bg-black/10 p-2"
        style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0,1fr))`, width: 240 }}
      >
        {tiles.map((tile, idx) => (
          <motion.button
            type="button"
            key={idx}
            layout
            onClick={() => tap(idx)}
            className="relative aspect-square overflow-hidden rounded-lg text-lg font-semibold"
            style={{
              visibility: tile === 0 ? "hidden" : "visible",
              backgroundColor: usableImage ? "transparent" : "white",
              backgroundImage: usableImage ? `url(${usableImage})` : undefined,
              backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
              backgroundPosition: usableImage
                ? `${(((tile - 1) % GRID) * 100) / (GRID - 1)}% ${(Math.floor((tile - 1) / GRID) * 100) / (GRID - 1)}%`
                : undefined,
            }}
          >
            {!usableImage && tile !== 0 && tile}
          </motion.button>
        ))}
      </div>

      {!solved && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={shuffleAgain}
            className="touch-target rounded-full bg-black/5 px-4 py-2 text-xs font-medium hover:bg-black/10"
          >
            🔀 Shuffle Again
          </button>
          <button
            type="button"
            onClick={solveForMe}
            className="touch-target rounded-full bg-[var(--dg-primary,#E85C7B)]/10 px-4 py-2 text-xs font-medium text-[var(--dg-primary,#E85C7B)] hover:bg-[var(--dg-primary,#E85C7B)]/20"
          >
            ✨ Solve it for me
          </button>
        </div>
      )}
    </div>
  );
}
