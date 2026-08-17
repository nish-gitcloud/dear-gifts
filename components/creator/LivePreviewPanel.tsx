"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { OccasionDefinition, GiftSectionConfig } from "@/types/gift";
import { ThemeScope } from "@/components/ThemeScope";
import { getTheme } from "@/config/themes";
import { getWrap } from "@/config/wraps";
import { WelcomeStage } from "@/components/recipient/stages/WelcomeStage";
import { BirthdayCakeStage } from "@/components/recipient/stages/BirthdayCakeStage";
import { MemoriesStage } from "@/components/recipient/stages/MemoriesStage";
import { WishesStage } from "@/components/recipient/stages/WishesStage";
import { ScratchStage } from "@/components/recipient/stages/ScratchStage";
import { LetterStage } from "@/components/recipient/stages/LetterStage";
import { GameStage } from "@/components/recipient/stages/GameStage";
import { ThenVsNowStage } from "@/components/recipient/stages/ThenVsNowStage";
import { RecipientMusicPlayer } from "@/components/recipient/RecipientMusicPlayer";
import { WrapIllustration, WRAP_COLORS, FALLBACK_WRAP_PALETTE } from "@/components/creator/fields/WrapPickerField";
import type { UploadedMediaMeta } from "@/components/creator/fields/MediaUploadField";

type SectionValues = Record<string, Record<string, unknown>>;

const FRAME_WIDTH = 260;
const FRAME_HEIGHT = 540;

function noop() {}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

/**
 * The always-on, per-step mock-up of what the recipient will actually see —
 * filled in live from whatever the creator has typed so far, and backed by
 * sensible defaults for anything not filled in yet, so the phone frame is
 * never empty (spec ask: "preview add karna hai sab field mein default
 * value ke saath ... har step ka preview show ho animated").
 *
 * Deliberately reuses the SAME stage components the real recipient
 * experience renders — this is a live look at the actual gift, not a
 * separately-drawn mock — scaled down inside a phone frame. Not every
 * occasion-specific step has a bespoke stage wired in here yet (e.g. the
 * proposal/apology-specific beats); those fall back to a themed placeholder
 * card rather than guessing at a layout, since a wrong-looking preview is
 * worse than a simple one.
 */
export function LivePreviewPanel({
  section,
  values,
  themeId,
}: {
  occasion: OccasionDefinition;
  section: GiftSectionConfig;
  values: SectionValues;
  themeId: string;
}) {
  const recipientName = str(values["recipient"]?.recipientName, "Alex");
  const valuesKey = JSON.stringify(values[section.id] ?? {});

  const body = useMemo(
    () => renderPreview(section, values, recipientName, themeId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [section.id, valuesKey, recipientName, themeId]
  );

  return (
    // md (not lg) so the panel doesn't silently disappear on more common
    // laptop-width windows — it was easy to lose entirely at in-between
    // widths, which read as "the preview doesn't show on this step" even
    // though the step itself was fine.
    <div className="sticky top-6 hidden w-full max-w-[260px] shrink-0 md:block">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-black/40">Live Preview</p>
      <div
        className="relative mx-auto overflow-hidden rounded-[2.5rem] border-[10px] border-black bg-black shadow-2xl"
        // content-box: FRAME_WIDTH/FRAME_HEIGHT are meant to be the visible
        // SCREEN area (what CenterFill/ScaledStage size their math against).
        // Tailwind's global border-box reset would otherwise eat 10px of
        // border from each side out of that budget, so the "frame" and the
        // "content area" silently disagreed by 20px in both dimensions —
        // a real contributor to content looking slightly cropped.
        style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, boxSizing: "content-box" }}
      >
        <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-black" aria-hidden />
        <div className="h-full w-full overflow-hidden rounded-[1.8rem] bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={section.id + valuesKey}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="h-full w-full"
            >
              {body}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] leading-snug text-black/35">
        Live, animated — updates as you fill this step in.
      </p>
    </div>
  );
}

/**
 * Forces its child to be centered — both axes — inside a fixed box that
 * exactly matches the phone frame's inner screen size, with any overflow
 * cropped symmetrically instead of hanging off one corner.
 *
 * Why this is needed: ThemeScope's own root div does stretch to fill this
 * frame correctly, but the plain `<div className="relative z-10">` it
 * wraps its `children` in in `components/ThemeScope.tsx` has no explicit
 * height — so a child inside it that asks for `h-full` resolves that
 * percentage against an ancestor with no set height, which collapses to
 * the child's own content size. The child then just sits at the natural
 * top-left flow position instead of filling/centering in the frame, which
 * is what made previews look "cut off" — a chunk of centered content
 * silently rendered outside the visible top-left corner. Wrapping with an
 * explicit *pixel* height here (not a percentage) sidesteps that break in
 * the chain entirely.
 */
function CenterFill({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex w-full items-center justify-center overflow-hidden"
      style={{ height: FRAME_HEIGHT }}
    >
      {children}
    </div>
  );
}

function ScaledStage({ children, scale = 0.5 }: { children: React.ReactNode; scale?: number }) {
  // The real stages are full-screen (min-h-screen) and can run taller than
  // our frame even after scaling — CenterFill (the parent) centers this box
  // and crops any excess evenly on all sides, which reads as "everything
  // stays centered" rather than "the bottom got cut off."
  return (
    <div
      style={{
        width: FRAME_WIDTH / scale,
        // CenterFill's parent is a flex container, and a plain block child
        // defaults to flex-shrink:1 — without pinning this, the browser was
        // free to shrink this div down to fit the frame's actual width
        // BEFORE the scale transform ever applied, silently defeating the
        // whole "lay it out oversized, then shrink visually" technique.
        // That's what made multi-item rows (memory cards, balloons) wrap
        // into a single narrow column instead of spreading out properly.
        flexShrink: 0,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
}

function PlaceholderPreview({ emoji, note }: { emoji: string; note: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-3 px-6 text-center">
      <motion.span
        animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="text-5xl"
      >
        {emoji}
      </motion.span>
      <p className="text-xs leading-snug opacity-70">{note}</p>
    </div>
  );
}

function renderPreview(section: GiftSectionConfig, values: SectionValues, recipientName: string, themeId: string) {
  const sectionId = section.id;
  const theme = getTheme(themeId);

  switch (sectionId) {
    case "theme":
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <PlaceholderPreview emoji={theme.emoji} note={theme.moodDescription} />
          </CenterFill>
        </ThemeScope>
      );

    case "gift-wrap": {
      const wrap = getWrap(str(values["gift-wrap"]?.wrapId, ""));
      const palette = WRAP_COLORS[wrap.id] ?? FALLBACK_WRAP_PALETTE;
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <div className="flex w-full flex-col items-center gap-3 px-6 text-center">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                <WrapIllustration category={wrap.category} palette={palette} />
              </motion.div>
              <p className="text-xs leading-snug opacity-70">{wrap.name} — tap to unwrap on the recipient&apos;s side.</p>
            </div>
          </CenterFill>
        </ThemeScope>
      );
    }

    case "recipient":
    case "from-you":
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <PlaceholderPreview emoji="💌" note={`This gift will greet ${recipientName} by name once opened.`} />
          </CenterFill>
        </ThemeScope>
      );

    case "mood": {
      const musicSource = str(values["mood"]?.musicSource, "") || undefined;
      const musicUrl = str(values["mood"]?.musicUrl, "") || undefined;
      const voiceNote = values["mood"]?.voiceNote as UploadedMediaMeta[] | undefined;
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <PlaceholderPreview
              emoji="🎵"
              note={musicSource ? "Playing your chosen track — tap 🔊 if it's muted." : "Pick a mood — music will play from the very first step."}
            />
          </CenterFill>
          {/* Actually plays the exact same track the recipient will hear (not
              just a description of it) — reuses the real player so "does
              this song play" is answered right here, live. The wrapper's own
              `transform` gives `position: fixed` descendants a new
              containing block scoped to THIS box (the phone screen) instead
              of the real browser viewport — without it, the player's mute
              button would float pinned to the corner of the whole wizard
              page instead of staying inside the little phone mock-up. */}
          <div className="absolute inset-0" style={{ transform: "translateZ(0)" }}>
            <RecipientMusicPlayer musicSource={musicSource} musicUrl={musicUrl} voiceNote={voiceNote} />
          </div>
        </ThemeScope>
      );
    }

    case "welcome":
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <ScaledStage>
              <WelcomeStage
                title={str(values["welcome"]?.introTitle, "Something special awaits you...")}
                subtitle={str(values["welcome"]?.introSubtitle, "I made a little world just for you.")}
                onContinue={noop}
              />
            </ScaledStage>
          </CenterFill>
        </ThemeScope>
      );

    case "cake":
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <ScaledStage>
              <BirthdayCakeStage
                name={recipientName}
                birthDate={str(values["recipient"]?.birthDate, "")}
                cakeId={str(values["cake"]?.cakeId, "cake-classic-pink")}
                onContinue={noop}
              />
            </ScaledStage>
          </CenterFill>
        </ThemeScope>
      );

    case "memories": {
      const media = values["memories"]?.media as UploadedMediaMeta[] | undefined;
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            {/* A smaller scale than the default 0.5 — Polaroid's 3 cards
                need roughly 560px of row width to sit side-by-side; at 0.5
                (520px) the 3rd card had nowhere to go but wrap onto its own
                row, which read as "the layout looks broken." */}
            <ScaledStage scale={0.4}>
              <MemoriesStage layout={str(values["memories"]?.layout, "polaroid")} media={media} onContinue={noop} />
            </ScaledStage>
          </CenterFill>
        </ThemeScope>
      );
    }

    case "wishes": {
      const wishes = ((values["wishes"]?.wishes as string[] | undefined) ?? []).filter(Boolean);
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            {/* Slightly smaller than default so up to 6 balloons (80px each
                + gaps) fit across one row instead of wrapping into a single
                narrow column. */}
            <ScaledStage scale={0.46}>
              <WishesStage wishes={wishes.length ? wishes : ["Wishing you endless joy today! 🎉"]} onContinue={noop} />
            </ScaledStage>
          </CenterFill>
        </ThemeScope>
      );
    }

    case "scratch":
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <ScaledStage>
              <ScratchStage
                title={str(values["scratch"]?.scratchTitle, "You uncovered it!")}
                message={str(values["scratch"]?.scratchMessage, "A little surprise, just for you. 💝")}
                onContinue={noop}
              />
            </ScaledStage>
          </CenterFill>
        </ThemeScope>
      );

    case "letter":
    case "sorry-letter": {
      const l = values["letter"] ?? values["sorry-letter"] ?? {};
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <ScaledStage>
              <LetterStage
                greeting={str(l.greeting, "Dear friend,")}
                body={str((l.body as string) ?? (l.sorryMessage as string), "Every word here is written just for you...")}
                signOff={str(l.signOff, "With love,")}
                onContinue={noop}
              />
            </ScaledStage>
          </CenterFill>
        </ThemeScope>
      );
    }

    case "then-vs-now": {
      const thenPhoto = values["then-vs-now"]?.thenPhoto as UploadedMediaMeta[] | undefined;
      const nowPhoto = values["then-vs-now"]?.nowPhoto as UploadedMediaMeta[] | undefined;
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <ScaledStage scale={0.42}>
              <ThenVsNowStage
                thenPhoto={thenPhoto}
                nowPhoto={nowPhoto}
                thenLabel={str(values["then-vs-now"]?.thenLabel, "Then")}
                nowLabel={str(values["then-vs-now"]?.nowLabel, "Now")}
                onContinue={noop}
              />
            </ScaledStage>
          </CenterFill>
        </ThemeScope>
      );
    }

    case "game": {
      const puzzleMedia = values["game"]?.puzzleImage as UploadedMediaMeta[] | undefined;
      const memoryMedia = values["memories"]?.media as UploadedMediaMeta[] | undefined;
      const fallbackPhoto = memoryMedia?.find((m) => m.kind === "image" && m.previewUrl)?.previewUrl;
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <ScaledStage scale={0.42}>
              <GameStage
                gameId={str(values["game"]?.gameId, "sliding-puzzle")}
                puzzleImage={puzzleMedia?.[0]?.previewUrl || fallbackPhoto}
                onContinue={noop}
              />
            </ScaledStage>
          </CenterFill>
        </ThemeScope>
      );
    }

    default:
      return (
        <ThemeScope themeId={themeId} className="h-full w-full">
          <CenterFill>
            <PlaceholderPreview emoji={theme.emoji} note={`This is where your "${section.stepLabel}" step will appear for the recipient.`} />
          </CenterFill>
        </ThemeScope>
      );
  }
}
