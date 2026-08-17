"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const CHAR_DELAY_MS = 18;

/**
 * Handwritten-style final letter with an envelope-open reveal (spec
 * sections 24 & 44). The letter types itself out character-by-character
 * once opened (spec ask: "text ek saath nahi, ek ek likhte hue animation ke
 * saath aaye") rather than appearing all at once — tapping the letter while
 * it's still typing skips straight to the full text, so it never feels like
 * a forced wait on a re-read.
 */
export function LetterStage({
  greeting,
  body,
  signOff,
  onContinue,
}: {
  greeting?: string;
  body?: string;
  signOff?: string;
  onContinue: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const [charsShown, setCharsShown] = useState(0);
  const reduceMotion = useReducedMotion();

  const fullText = useMemo(() => {
    const paragraphs = (body ?? "").split("\n").filter(Boolean);
    return [greeting, ...paragraphs, signOff].filter(Boolean).join("\n\n");
  }, [greeting, body, signOff]);

  const done = reduceMotion === true || charsShown >= fullText.length;

  useEffect(() => {
    if (!opened || reduceMotion) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time typewriter reset the instant the letter opens, driven by a timer below, not derivable during render.
    setCharsShown(0);
    const id = window.setInterval(() => {
      setCharsShown((c) => {
        if (c >= fullText.length) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, CHAR_DELAY_MS);
    return () => window.clearInterval(id);
  }, [opened, fullText, reduceMotion]);

  const visibleText = done ? fullText : fullText.slice(0, charsShown);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">A Letter Just For You</h2>

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.button
            key="envelope"
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setOpened(true)}
            whileTap={{ scale: 0.95 }}
            className="touch-target mt-10 text-8xl"
            aria-label="Open the letter"
          >
            💌
          </motion.button>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 30, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7 }}
            onClick={() => setCharsShown(fullText.length)}
            className="font-hand mt-8 max-w-md cursor-pointer whitespace-pre-line rounded-lg bg-[#fdf9ef] p-8 text-left text-xl leading-relaxed text-[#3a2f28] shadow-2xl"
            style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.02), transparent 60%)" }}
            title={done ? undefined : "Tap to reveal the rest"}
          >
            {visibleText}
            {!done && (
              <motion.span
                aria-hidden
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                className="ml-0.5 inline-block w-[2px] translate-y-0.5 bg-[#3a2f28]"
                style={{ height: "1em" }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {opened && done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-10">
          <Button onClick={onContinue}>Continue</Button>
        </motion.div>
      )}
    </div>
  );
}
