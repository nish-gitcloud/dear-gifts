"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { OccasionDefinition } from "@/types/gift";
import { ThemeScope } from "@/components/ThemeScope";
import { getWrap } from "@/config/wraps";
import { trackEvent } from "@/lib/analyticsClient";
import { UnlockStage } from "./stages/UnlockStage";
import { WelcomeStage } from "./stages/WelcomeStage";
import { BirthdayCakeStage } from "./stages/BirthdayCakeStage";
import { MemoriesStage } from "./stages/MemoriesStage";
import { RecipientMusicPlayer } from "./RecipientMusicPlayer";
import { DeviceStatusBar } from "./DeviceStatusBar";
import { GameStage } from "./stages/GameStage";
import { WishesStage } from "./stages/WishesStage";
import { ScratchStage } from "./stages/ScratchStage";
import { LetterStage } from "./stages/LetterStage";
import { EndStage } from "./stages/EndStage";
import { GenericStage } from "./stages/GenericStage";
import { ToastStage } from "./stages/ToastStage";
import { TimelineStage } from "./stages/TimelineStage";
import { ThenVsNowStage } from "./stages/ThenVsNowStage";
import { PromiseStage } from "./stages/PromiseStage";
import { RingBoxStage } from "./stages/RingBoxStage";
import { JarOfReasonsStage } from "./stages/JarOfReasonsStage";
import { BuildUpStage } from "./stages/BuildUpStage";
import { ProposalFinaleStage } from "./stages/ProposalFinaleStage";
import { ApologyGiftStage } from "./stages/ApologyGiftStage";
import { BrokenHeartStage } from "./stages/BrokenHeartStage";
import { LetItGoStage } from "./stages/LetItGoStage";
import { PledgeStage } from "./stages/PledgeStage";
import { CelebrationStage } from "./stages/CelebrationStage";
import { TrophyStage } from "./stages/TrophyStage";
import type { UploadedMediaMeta } from "@/components/creator/fields/MediaUploadField";
import type { Milestone } from "@/components/creator/fields/MilestoneListField";

type SectionValues = Record<string, Record<string, unknown>>;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/**
 * Walks the occasion's recipientFlow and renders one full-screen stage at a
 * time (spec section 2 & 34). This is the single playback engine every
 * occasion shares — occasions differ only in which stages are in their
 * `recipientFlow` array and what section data feeds them, never in how the
 * engine itself works (spec section 76).
 */
export function RecipientExperience({
  occasion,
  values,
  skipUnlock = false,
  onVerifyPin,
  giftToken,
  sessionId,
}: {
  occasion: OccasionDefinition;
  values: SectionValues;
  skipUnlock?: boolean;
  /** When provided, PIN checks go through this (server-backed) verifier instead of a client-side compare. */
  onVerifyPin?: (pin: string) => Promise<{ valid: boolean; locked: boolean; message?: string }>;
  /**
   * Recipient-funnel analytics (spec section 58) — both undefined in
   * Preview Mode (app/create/[occasion]/preview), where there's no real
   * gift/session to attribute events to, so every trackEvent call below is
   * a no-op there.
   */
  giftToken?: string;
  sessionId?: string;
}) {
  // "unlock" is a documentation-only entry in each occasion's recipientFlow
  // array (spec section 29 lists it as the conceptual first beat) — actual
  // PIN gating always happens above, in the `!unlocked` branch below, via a
  // dedicated UnlockStage render that's completely separate from this
  // stage-by-stage walk. Leaving "unlock" in `flow` meant it fell through to
  // the generic fallback stage and rendered a redundant, literal "unlock"
  // screen right after the real PIN check succeeded. "age-counter" is
  // filtered for the same reason — its data is folded directly into
  // BirthdayCakeStage rather than being its own stage.
  const flow = occasion.recipientFlow.filter((k) => k !== "age-counter" && k !== "unlock" && k !== "cake");
  const [unlocked, setUnlocked] = useState(skipUnlock);
  const [stageIndex, setStageIndex] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);

  const themeId = str(values["theme"]?.themeId, occasion.accentTheme);
  const wrap = getWrap(str(values["gift-wrap"]?.wrapId, ""));
  const recipient = values["recipient"] ?? {};
  const mood = values["mood"] ?? {};

  function next() {
    if (giftToken && sessionId) {
      const currentStage = flow[stageIndex];
      trackEvent("stage_completed", { giftToken, sessionId, step: currentStage });
      if (flow[stageIndex + 1] === "end" || stageIndex + 1 >= flow.length) {
        trackEvent("gift_completed", { giftToken, sessionId });
      }
    }
    setStageIndex((i) => Math.min(i + 1, flow.length - 1));
  }

  function watchAgain() {
    if (giftToken && sessionId) trackEvent("watch_again", { giftToken, sessionId });
    setUnlocked(skipUnlock);
    setStageIndex(0);
    setSessionKey((k) => k + 1);
  }

  if (!unlocked) {
    return (
      <ThemeScope themeId={themeId} key={`unlock-${sessionKey}`}>
        <DeviceStatusBar />
        <UnlockStage
          wrapId={wrap.id}
          wrapCategory={wrap.category}
          pinHint={str(recipient.pinHint)}
          expectedPin={onVerifyPin ? undefined : str(recipient.secretPin)}
          onVerifyPin={onVerifyPin}
          onUnlocked={() => setUnlocked(true)}
        />
        {/* Music starts from the very first screen (the gift-tap/PIN
            screen), not only after unlocking — spec ask: "songs first step
            se hi chahiye". Keyed the same as the post-unlock player below so
            it's the SAME player instance carrying across the unlock
            transition (no restart/replay glitch). */}
        <RecipientMusicPlayer
          key={`music-${sessionKey}`}
          musicSource={str(mood.musicSource, "") || undefined}
          musicUrl={str(mood.musicUrl, "") || undefined}
          voiceNote={mood.voiceNote as UploadedMediaMeta[] | undefined}
        />
      </ThemeScope>
    );
  }

  const stageKey = flow[stageIndex];

  return (
    <ThemeScope themeId={themeId} key={`stage-${sessionKey}`}>
      <DeviceStatusBar />
      <AnimatePresence mode="wait">
        {renderStage(stageKey, { occasion, values, next, watchAgain, recipientName: str(recipient.recipientName, "you") })}
      </AnimatePresence>
      <RecipientMusicPlayer
        key={`music-${sessionKey}`}
        musicSource={str(mood.musicSource, "") || undefined}
        musicUrl={str(mood.musicUrl, "") || undefined}
        voiceNote={mood.voiceNote as UploadedMediaMeta[] | undefined}
      />
    </ThemeScope>
  );
}

function renderStage(
  stageKey: string,
  ctx: { occasion: OccasionDefinition; values: SectionValues; next: () => void; watchAgain: () => void; recipientName: string }
) {
  const { values, next, watchAgain, recipientName } = ctx;

  switch (stageKey) {
    case "welcome":
      return (
        <WelcomeStage
          key={stageKey}
          title={str(values["welcome"]?.introTitle)}
          subtitle={str(values["welcome"]?.introSubtitle)}
          onContinue={next}
        />
      );
    case "birthday-reveal":
      return (
        <BirthdayCakeStage
          key={stageKey}
          name={recipientName}
          birthDate={str(values["recipient"]?.birthDate)}
          cakeId={str(values["cake"]?.cakeId)}
          onContinue={next}
        />
      );
    case "memories": {
      const media = values["memories"]?.media as UploadedMediaMeta[] | undefined;
      return (
        <MemoriesStage key={stageKey} layout={str(values["memories"]?.layout, "polaroid")} media={media} onContinue={next} />
      );
    }
    case "game": {
      const puzzleMedia = values["game"]?.puzzleImage as UploadedMediaMeta[] | undefined;
      // "Puzzle Image (optional — uses a memory photo by default)" is what
      // the wizard field promises — this is the fallback that makes that
      // true, rather than silently leaving the puzzle imageless.
      const memoryMedia = values["memories"]?.media as UploadedMediaMeta[] | undefined;
      const fallbackPhoto = memoryMedia?.find((m) => m.kind === "image" && m.previewUrl)?.previewUrl;
      return (
        <GameStage
          key={stageKey}
          gameId={str(values["game"]?.gameId)}
          puzzleImage={puzzleMedia?.[0]?.previewUrl || fallbackPhoto}
          onContinue={next}
        />
      );
    }
    case "wishes":
      return <WishesStage key={stageKey} wishes={(values["wishes"]?.wishes as string[]) ?? []} onContinue={next} />;
    case "scratch":
      return (
        <ScratchStage
          key={stageKey}
          title={str(values["scratch"]?.scratchTitle)}
          message={str(values["scratch"]?.scratchMessage)}
          onContinue={next}
        />
      );
    case "letter": {
      const letterData = values["letter"] ?? values["sorry-letter"] ?? {};
      return (
        <LetterStage
          key={stageKey}
          greeting={str(letterData.greeting, "Dear friend,")}
          body={str(letterData.body ?? letterData.sorryMessage)}
          signOff={str(letterData.signOff, "With love,")}
          onContinue={next}
        />
      );
    }
    case "end":
      return <EndStage key={stageKey} recipientName={recipientName} onWatchAgain={watchAgain} />;

    // --- Anniversary -----------------------------------------------------
    case "toast":
      return <ToastStage key={stageKey} toastId={str(values["toast"]?.toastId, "champagne")} onContinue={next} />;
    case "timeline":
      return <TimelineStage key={stageKey} milestones={values["story"]?.milestones as Milestone[] | undefined} onContinue={next} />;
    case "then-vs-now":
      return (
        <ThenVsNowStage
          key={stageKey}
          thenPhoto={values["then-vs-now"]?.thenPhoto as UploadedMediaMeta[] | undefined}
          nowPhoto={values["then-vs-now"]?.nowPhoto as UploadedMediaMeta[] | undefined}
          thenLabel={str(values["then-vs-now"]?.thenLabel)}
          nowLabel={str(values["then-vs-now"]?.nowLabel)}
          onContinue={next}
        />
      );
    case "promise":
      return <PromiseStage key={stageKey} promiseText={str(values["promise"]?.promiseText)} onContinue={next} />;

    // --- Proposal ----------------------------------------------------------
    case "jar-of-reasons":
      return <JarOfReasonsStage key={stageKey} reasons={values["jar-of-reasons"]?.reasons as string[] | undefined} onContinue={next} />;
    case "build-up":
      return <BuildUpStage key={stageKey} onContinue={next} />;
    case "ring":
      return <RingBoxStage key={stageKey} onContinue={next} />;
    case "proposal-finale":
      return <ProposalFinaleStage key={stageKey} question={str(values["ring"]?.proposalQuestion)} onContinue={next} />;

    // --- Apology -------------------------------------------------------
    case "apology-gift":
      return <ApologyGiftStage key={stageKey} giftType={str(values["apology-gift"]?.giftType)} onContinue={next} />;
    case "broken-heart":
      return <BrokenHeartStage key={stageKey} onContinue={next} />;
    case "let-it-go":
      return <LetItGoStage key={stageKey} onContinue={next} />;
    case "pledge":
      return <PledgeStage key={stageKey} pledgeText={str(values["pledge"]?.pledgeText)} onContinue={next} />;

    // --- Custom Wishes ---------------------------------------------------
    case "celebration":
      return <CelebrationStage key={stageKey} elements={values["celebration"]?.elements as string[] | undefined} onContinue={next} />;

    // --- Congratulations / Festival (shared/simple stages) ----------------
    case "trophy-reveal":
      return <TrophyStage key={stageKey} onContinue={next} />;
    case "festival-reveal":
      return <GenericStage key={stageKey} stageKey={stageKey} onContinue={next} />;

    default:
      return <GenericStage key={stageKey} stageKey={stageKey} onContinue={next} />;
  }
}
