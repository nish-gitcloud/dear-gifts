"use client";

import { useState } from "react";
import { CakeStage } from "./CakeStage";
import { FireworksStage } from "./FireworksStage";
import { FlowerStage } from "./FlowerStage";
import { TrophyStage } from "./TrophyStage";
import { ToastStage } from "./ToastStage";
import { RingBoxStage } from "./RingBoxStage";
import { BrokenHeartStage } from "./BrokenHeartStage";

const ORDER = ["cake", "fireworks", "flower", "trophy", "champagne", "ring-box", "heart-heal"] as const;

/**
 * Custom Wishes' "Add a Celebration" stage dynamically renders only the
 * interactive elements the creator selected, one at a time, in a fixed
 * emotional order (spec sections 16 & 30). This is the one recipientFlow
 * entry whose sub-sequence isn't statically known — it fans out based on
 * `elements` rather than being one fixed component.
 */
export function CelebrationStage({ elements, onContinue }: { elements?: string[]; onContinue: () => void }) {
  const active = ORDER.filter((key) => (elements ?? []).includes(key));
  const sequence = active.length ? active : ["cake" as const];
  const [index, setIndex] = useState(0);

  function advance() {
    if (index >= sequence.length - 1) {
      onContinue();
    } else {
      setIndex((i) => i + 1);
    }
  }

  const current = sequence[index];

  switch (current) {
    case "cake":
      return <CakeStage cakeId="cake-classic-pink" onContinue={advance} />;
    case "fireworks":
      return <FireworksStage onContinue={advance} />;
    case "flower":
      return <FlowerStage onContinue={advance} />;
    case "trophy":
      return <TrophyStage onContinue={advance} />;
    case "champagne":
      return <ToastStage toastId="champagne" onContinue={advance} />;
    case "ring-box":
      return <RingBoxStage onContinue={advance} />;
    case "heart-heal":
      return <BrokenHeartStage onContinue={advance} />;
    default:
      return <CakeStage cakeId="cake-classic-pink" onContinue={advance} />;
  }
}
