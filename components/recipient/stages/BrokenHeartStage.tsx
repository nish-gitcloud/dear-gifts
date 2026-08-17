"use client";

import { useState } from "react";
import { StageShell } from "../StageShell";
import { HeartHealInteractive } from "../HeartHealInteractive";

/** "The Broken Heart" — gradually repairs through interaction (spec section 15). */
export function BrokenHeartStage({ onContinue }: { onContinue: () => void }) {
  const [healed, setHealed] = useState(false);

  return (
    <StageShell
      title={healed ? "I hope we can make something beautiful again." : "The Broken Heart"}
      onContinue={healed ? onContinue : undefined}
      hideContinue={!healed}
    >
      <HeartHealInteractive onHealed={() => setHealed(true)} />
    </StageShell>
  );
}
