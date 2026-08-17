"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const SYMBOLS = ["💖", "✨", "🎈", "🎁", "🌸", "🎂"]; // predefined difficulty (spec section 21)

interface Card {
  id: number;
  symbol: string;
  matched: boolean;
}

function buildDeck(): Card[] {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((symbol, id) => ({ id, symbol, matched: false }));
}

export function MemoryMatch({ onSolved }: { onSolved: () => void }) {
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const allMatched = useMemo(() => cards.every((c) => c.matched), [cards]);

  useEffect(() => {
    if (allMatched) onSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    const timeout = setTimeout(() => {
      setCards((prev) => {
        if (prev[a].symbol === prev[b].symbol) {
          return prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
        }
        return prev;
      });
      setFlipped([]);
    }, 600);
    return () => clearTimeout(timeout);
  }, [flipped]);

  function tap(idx: number) {
    if (flipped.length === 2 || flipped.includes(idx) || cards[idx].matched) return;
    setFlipped((f) => [...f, idx]);
  }

  return (
    <div className="mx-auto grid grid-cols-4 gap-2" style={{ width: 260 }}>
      {cards.map((card, idx) => {
        const isRevealed = card.matched || flipped.includes(idx);
        return (
          <motion.button
            type="button"
            key={card.id}
            onClick={() => tap(idx)}
            className="flex aspect-square items-center justify-center rounded-xl text-xl"
            animate={{ rotateY: isRevealed ? 0 : 180 }}
            style={{
              backgroundColor: isRevealed ? "white" : "var(--dg-primary,#E85C7B)",
              opacity: card.matched ? 0.5 : 1,
            }}
          >
            {isRevealed ? card.symbol : ""}
          </motion.button>
        );
      })}
    </div>
  );
}
