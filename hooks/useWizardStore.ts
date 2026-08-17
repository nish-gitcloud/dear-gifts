"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OccasionId } from "@/types/gift";
import { getDemoData } from "@/lib/demoData";

interface WizardStore {
  occasion: OccasionId | null;
  currentStepIndex: number;
  values: Record<string, Record<string, unknown>>;
  lastSavedAt: string | null;

  startOccasion: (occasion: OccasionId) => void;
  setFieldValue: (sectionId: string, fieldId: string, value: unknown) => void;
  setSectionValues: (sectionId: string, values: Record<string, unknown>) => void;
  goToStep: (index: number) => void;
  nextStep: (maxIndex: number) => void;
  prevStep: () => void;
  reset: () => void;
}

/**
 * Wizard state, persisted to localStorage so a refresh mid-creation restores
 * exactly where the person left off (spec sections 11 & 59: "Autosave
 * creator progress" / "Continue creating your surprise?"). Once Supabase is
 * wired up (Phase 1 follow-up), the same shape can additionally sync to a
 * `gifts` draft row keyed by a locally-generated draft id.
 */
export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      occasion: null,
      currentStepIndex: 0,
      values: {},
      lastSavedAt: null,

      // Every step starts pre-filled with the same tasteful demo content
      // Preview Mode falls back to (spec ask: "every step and every field
      // should have a default value") — real typing always overwrites it
      // field-by-field via setFieldValue below. `structuredClone` matters
      // here: without it, every new wizard would share the SAME nested
      // objects/arrays as the module-level DEMO_DATA, so editing e.g. the
      // seeded wishes list in one gift would silently corrupt the demo
      // fallback for every other occasion for the rest of the session.
      startOccasion: (occasion) =>
        set({
          occasion,
          currentStepIndex: 0,
          values: structuredClone(getDemoData(occasion)),
          lastSavedAt: new Date().toISOString(),
        }),

      setFieldValue: (sectionId, fieldId, value) => {
        const values = { ...get().values };
        values[sectionId] = { ...(values[sectionId] ?? {}), [fieldId]: value };
        set({ values, lastSavedAt: new Date().toISOString() });
      },

      setSectionValues: (sectionId, sectionValues) => {
        const values = { ...get().values };
        values[sectionId] = { ...(values[sectionId] ?? {}), ...sectionValues };
        set({ values, lastSavedAt: new Date().toISOString() });
      },

      goToStep: (index) => set({ currentStepIndex: index }),
      nextStep: (maxIndex) => set({ currentStepIndex: Math.min(get().currentStepIndex + 1, maxIndex) }),
      prevStep: () => set({ currentStepIndex: Math.max(get().currentStepIndex - 1, 0) }),

      reset: () => set({ occasion: null, currentStepIndex: 0, values: {}, lastSavedAt: null }),
    }),
    { name: "dear-gifts-wizard" }
  )
);
