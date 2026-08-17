"use client";

import { StageShell } from "../StageShell";

export function WelcomeStage({
  title,
  subtitle,
  onContinue,
}: {
  title?: string;
  subtitle?: string;
  onContinue: () => void;
}) {
  return (
    <StageShell
      title={title || "Something special awaits you..."}
      subtitle={subtitle || "I made a little world just for you."}
      onContinue={onContinue}
    />
  );
}
