"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FieldProps } from "./shared";

interface TrackMeta {
  icon: string;
  description: string;
  /** A real bundled audio file to preview, when one exists for this track. */
  audioUrl?: string;
  /** A short, deterministic note sequence (Hz) used as the preview ONLY
   *  when there's no real `audioUrl` — a synthesized stand-in so a preset
   *  without a bundled file still audibly previews as something. */
  notes: number[];
}

const TRACK_META: Record<string, TrackMeta> = {
  "dooron-dooron": { icon: "🎻", description: "The original default track.", audioUrl: "/audio/dooron-dooron.mp3", notes: [392, 440, 494, 523] },
  custom: { icon: "🎧", description: "Your own link or upload.", notes: [] },
};

const FALLBACK_META: TrackMeta = { icon: "🎵", description: "A little tune to set the mood.", notes: [440, 494, 523] };

/**
 * Media-style song picker (spec: "Set the Mood"). Tapping a preset track
 * plays a short live preview — the real bundled file when one exists, or a
 * synthesized chime (Web Audio API) otherwise — so the choice is heard, not
 * just read; the preview matches what the recipient will actually hear
 * instead of a generic placeholder tone. Custom skips preview entirely
 * since the real audio comes from the fields just below this one. Selecting
 * an option always sets the value even while its preview is still sounding.
 */
export function MoodPickerField({ field, value, onChange }: FieldProps<string>) {
  const selected = (value as string) || "";
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  function stopRealAudio() {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
  }

  function schedule(ctx: AudioContext, notes: number[]) {
    const noteLength = 0.22;
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * noteLength;
      const end = start + noteLength * 0.92;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      gain.gain.linearRampToValueAtTime(0, end);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    });
  }

  function playPreview(id: string, meta: TrackMeta) {
    // Tapping the currently-playing card again just stops it.
    if (playingId === id) {
      stopRealAudio();
      setPlayingId(null);
      return;
    }
    stopRealAudio();

    if (meta.audioUrl) {
      const audio = new Audio(meta.audioUrl);
      audio.volume = 0.7;
      audioElRef.current = audio;
      setPlayingId(id);
      audio.play().catch(() => setPlayingId((cur) => (cur === id ? null : cur)));
      audio.onended = () => setPlayingId((cur) => (cur === id ? null : cur));
      // A short taste is enough for a picker preview — no need to play the
      // whole track just to confirm which song this is.
      window.setTimeout(() => {
        if (audioElRef.current === audio) {
          audio.pause();
          setPlayingId((cur) => (cur === id ? null : cur));
        }
      }, 6000);
      return;
    }

    if (meta.notes.length === 0) return;
    if (typeof window === "undefined") return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
    const ctx = audioCtxRef.current;
    setPlayingId(id);

    // `ctx.currentTime` doesn't reliably advance until the context is
    // actually running — scheduling notes against it while still
    // "suspended" (the state right after creation, before a resume()
    // completes) could silently schedule them in the past. Waiting for
    // resume() to resolve before scheduling means every note is guaranteed
    // audible, not just the ones lucky enough to land after resume finished
    // in time.
    if (ctx.state === "suspended") {
      ctx.resume().then(() => schedule(ctx, meta.notes));
    } else {
      schedule(ctx, meta.notes);
    }

    window.setTimeout(() => {
      setPlayingId((cur) => (cur === id ? null : cur));
    }, meta.notes.length * 220 + 100);
  }

  return (
    <div>
      <span className="mb-3 block text-sm font-medium text-[#241A17]">
        {field.label}
        {field.required && <span className="text-[#E85C7B]"> *</span>}
      </span>
      <div className="space-y-2.5">
        {field.options?.map((opt) => {
          const meta = TRACK_META[opt.value] ?? FALLBACK_META;
          const isSelected = selected === opt.value;
          const isPlaying = playingId === opt.value;
          const canPreview = Boolean(meta.audioUrl) || meta.notes.length > 0;
          return (
            <motion.button
              key={opt.value}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onChange(opt.value);
                playPreview(opt.value, meta);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-3.5 text-left shadow-sm transition-colors",
                isSelected ? "border-[#E85C7B] bg-[#E85C7B]/5" : "border-black/10 hover:border-black/20"
              )}
            >
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl transition",
                  isPlaying ? "bg-[#E85C7B]/15 animate-pulse" : "bg-black/5"
                )}
              >
                {meta.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#241A17]">{opt.label}</p>
                <p className="truncate text-xs text-black/50">{opt.description ?? meta.description}</p>
              </div>
              <span className="shrink-0 text-lg">
                {isSelected ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E85C7B] text-xs text-white">
                    ✓
                  </span>
                ) : canPreview ? (
                  <span className="text-black/30">{isPlaying ? "🔊" : "▶️"}</span>
                ) : null}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
