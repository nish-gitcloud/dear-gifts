"use client";

import { useEffect, useRef, useState } from "react";
import type { UploadedMediaMeta } from "@/components/creator/fields/MediaUploadField";

// The real, licensed default track — bundled in the project so "Dooron
// Doron Main" actually plays the intended song for every recipient, not a
// generated stand-in.
const PRESET_AUDIO_URLS: Record<string, string> = {
  "dooron-dooron": "/audio/dooron-dooron.mp3",
};

// Fallback for any preset that doesn't (yet) have a bundled audio file —
// a short, recognizable live-generated ambient loop instead of silently
// doing nothing.
const PRESET_NOTES: Record<string, number[]> = {
  "dooron-dooron": [392, 440, 494, 523],
};

/**
 * Plays the gift's chosen background music for the recipient (spec: "Set
 * the Mood" should actually be heard, not just recorded). The built-in
 * preset plays its real bundled track; a custom URL or uploaded voice note
 * plays as real audio too. Autoplay can be blocked by the browser even
 * right after the unlock tap — in that case the toggle button doubles as a
 * "tap for sound" prompt.
 */
export function RecipientMusicPlayer({
  musicSource,
  musicUrl,
  voiceNote,
}: {
  musicSource?: string;
  musicUrl?: string;
  voiceNote?: UploadedMediaMeta[];
}) {
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Lets `retryOrToggle` (below) actually restart the generated melody after
  // a successful manual resume — see the effect for why this exists.
  const restartLoopRef = useRef<(() => void) | null>(null);

  const uploadedVoiceUrl = voiceNote?.find((v) => v.status === "done" && v.previewUrl)?.previewUrl;
  // "Custom song" covers both ways of providing one — a pasted link or an
  // uploaded file — preferring whichever the creator actually gave (a link,
  // if they used both). A built-in preset plays its real bundled file when
  // one exists; only presets without a bundled file fall back to the
  // synthesized loop below.
  const presetAudioUrl = musicSource ? PRESET_AUDIO_URLS[musicSource] : undefined;
  const realUrl = musicSource === "custom" ? musicUrl || uploadedVoiceUrl : presetAudioUrl;
  const presetNotes = !realUrl && musicSource ? PRESET_NOTES[musicSource] : undefined;

  useEffect(() => {
    if (muted) return undefined;

    if (realUrl) {
      const audio = new Audio(realUrl);
      audio.loop = true;
      audio.volume = 0.55;
      audioElRef.current = audio;
      audio
        .play()
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true));
      return () => {
        audio.pause();
        audioElRef.current = null;
      };
    }

    if (presetNotes && typeof window !== "undefined") {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return undefined;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      let stopped = false;
      let timeoutId: number | null = null;

      function playLoop() {
        // `ctx.resume()` is async, so checking `ctx.state` synchronously
        // right after calling it (the old code) almost always saw
        // "suspended" still — the loop bailed out on its very first call
        // and, since the only recursive `setTimeout` call lives AFTER this
        // guard, nothing ever scheduled a retry. Tapping "unmute" later
        // resumed the *context*, but nothing ever called `playLoop` again,
        // so it stayed silent forever. Now `playLoop` is only ever invoked
        // from inside a resolved `resume()` (below, and again from
        // `retryOrToggle`), so this guard is just a safety net, not the
        // thing silently swallowing every attempt to play.
        if (stopped || ctx.state !== "running") return;
        const now = ctx.currentTime;
        presetNotes!.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          const start = now + i * 0.65;
          const end = start + 0.6;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.045, start + 0.08);
          gain.gain.linearRampToValueAtTime(0, end);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(end + 0.02);
        });
        timeoutId = window.setTimeout(playLoop, presetNotes!.length * 650 + 900);
      }

      restartLoopRef.current = () => {
        if (ctx.state === "running" && timeoutId === null) playLoop();
      };

      ctx
        .resume()
        .then(() => {
          const running = ctx.state === "running";
          setBlocked(!running);
          if (running) playLoop();
        })
        .catch(() => setBlocked(true));

      return () => {
        stopped = true;
        if (timeoutId !== null) window.clearTimeout(timeoutId);
        restartLoopRef.current = null;
        ctx.close().catch(() => {});
        audioCtxRef.current = null;
      };
    }
    return undefined;
  }, [muted, realUrl, presetNotes]);

  // Real, unconditional autoplay (audio starting with literally zero user
  // interaction) is a hard browser-level restriction on every mobile and
  // desktop browser — not something any app-level code can override. But
  // the recipient is always about to tap *something* within a second or
  // two of landing on this screen (the gift box itself, then the PIN pad),
  // and browsers treat that as a genuine user gesture. Retrying the exact
  // same play()/resume() calls the instant that first tap happens — on
  // ANY element, not just this button — means the song is already playing
  // by the time the gift opens, so from the recipient's side it looks and
  // feels like real autoplay; "Tap for sound" only ever shows up if even
  // that retry gets blocked (rare).
  useEffect(() => {
    if (muted) return undefined;
    function tryStartOnFirstGesture() {
      audioElRef.current
        ?.play()
        .then(() => setBlocked(false))
        .catch(() => {});
      const ctx = audioCtxRef.current;
      ctx
        ?.resume()
        .then(() => {
          const running = ctx.state === "running";
          setBlocked(!running);
          if (running) restartLoopRef.current?.();
        })
        .catch(() => {});
    }
    const opts = { once: true, capture: true } as const;
    window.addEventListener("pointerdown", tryStartOnFirstGesture, opts);
    window.addEventListener("keydown", tryStartOnFirstGesture, opts);
    return () => {
      window.removeEventListener("pointerdown", tryStartOnFirstGesture, opts);
      window.removeEventListener("keydown", tryStartOnFirstGesture, opts);
    };
  }, [muted]);

  function retryOrToggle() {
    if (blocked) {
      audioElRef.current?.play().then(() => setBlocked(false)).catch(() => {});
      audioCtxRef.current
        ?.resume()
        .then(() => {
          setBlocked(false);
          // The context resuming doesn't restart the melody loop by
          // itself — this is what actually makes a second tap on "Tap for
          // sound" produce audio instead of just flipping the icon.
          restartLoopRef.current?.();
        })
        .catch(() => {});
      return;
    }
    setMuted((m) => !m);
  }

  if (!musicSource || (!realUrl && !presetNotes)) return null;

  return (
    <button
      type="button"
      onClick={retryOrToggle}
      aria-label={blocked ? "Tap for sound" : muted ? "Unmute background music" : "Mute background music"}
      className="fixed bottom-4 right-4 z-50 flex h-11 items-center gap-1.5 rounded-full bg-black/45 px-3 text-sm text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60"
    >
      {blocked ? (
        <>🔈 <span className="text-xs font-medium">Tap for sound</span></>
      ) : muted ? (
        "🔇"
      ) : (
        "🔊"
      )}
    </button>
  );
}
