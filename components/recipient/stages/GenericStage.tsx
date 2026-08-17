"use client";

import { StageShell } from "../StageShell";

const STAGE_COPY: Record<string, { title: string; subtitle?: string; icon: string }> = {
  toast: { title: "Raise a Toast", subtitle: "To every year with you.", icon: "🥂" },
  timeline: { title: "Our Story", icon: "📖" },
  "then-vs-now": { title: "Then vs Now", icon: "🔄" },
  promise: { title: "A Promise, Renewed", icon: "💫" },
  "jar-of-reasons": { title: "A Jar of Reasons", icon: "🫙" },
  ring: { title: "One More Step...", icon: "💍" },
  "build-up": { title: "There's something I need to tell you...", icon: "✨" },
  "proposal-finale": { title: "Will you marry me?", icon: "💍" },
  "apology-gift": { title: "A Small Gesture", icon: "🎁" },
  "broken-heart": { title: "The Broken Heart", subtitle: "Hold to help it heal.", icon: "💔" },
  "let-it-go": { title: "Let It Go", icon: "🕊️" },
  pledge: { title: "My Pledge To You", icon: "🤝" },
  "sorry-letter": { title: "I'm Sorry", icon: "🥺" },
  celebration: { title: "Let's Celebrate!", icon: "🎉" },
  "trophy-reveal": { title: "You Did It!", icon: "🏆" },
  "festival-reveal": { title: "Celebrating You", icon: "🪔" },
};

/**
 * Fallback renderer for occasion-specific stages that don't yet have a
 * bespoke interactive component (e.g. anniversary's "Renew a Promise",
 * proposal's "Ring Box"). Keeps the flow fully playable for every occasion
 * today, while leaving a clear seam for a dedicated component later — the
 * architecture never requires touching the orchestrator to add one (spec
 * section 29).
 */
export function GenericStage({
  stageKey,
  text,
  onContinue,
}: {
  stageKey: string;
  text?: string;
  onContinue: () => void;
}) {
  const copy = STAGE_COPY[stageKey] ?? { title: stageKey, icon: "✨" };
  return (
    <StageShell title={copy.title} subtitle={copy.subtitle} onContinue={onContinue}>
      <div className="flex flex-col items-center gap-4">
        <span className="text-7xl">{copy.icon}</span>
        {text && <p className="max-w-sm text-sm opacity-70">{text}</p>}
      </div>
    </StageShell>
  );
}
