"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { OccasionDefinition } from "@/types/gift";
import { useWizardStore } from "@/hooks/useWizardStore";
import { ProgressBar } from "./ProgressBar";
import { SectionForm, isSectionComplete } from "./SectionForm";
import { LivePreviewPanel } from "./LivePreviewPanel";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analyticsClient";

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v ? v : fallback;
}

export function CreatorWizard({ occasion }: { occasion: OccasionDefinition }) {
  const router = useRouter();
  const store = useWizardStore();
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [checkedResume, setCheckedResume] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // On first mount, decide whether to resume an in-progress draft for this
  // occasion or start fresh (spec section 59: "Continue creating your
  // surprise?"). This must run after mount (not during the initial render)
  // because the wizard store hydrates from localStorage — a value the
  // server-rendered pass never has — so we render nothing until this
  // decision is made, avoiding a hydration mismatch.
  useEffect(() => {
    if (checkedResume) return;
    if (store.occasion === occasion.id && store.currentStepIndex > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time decision gated on localStorage-hydrated store state, not derivable during render/SSR.
      setShowResumeBanner(true);
    } else if (store.occasion !== occasion.id) {
      store.startOccasion(occasion.id);
    }
    setCheckedResume(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occasion.id]);

  // Creator-funnel step tracking (spec section 58). Runs unconditionally
  // (guarding inside the effect body, not around the hook call) so hook
  // order stays stable across the resume-banner/wizard render branches below.
  useEffect(() => {
    if (!checkedResume || showResumeBanner) return;
    const idx = Math.min(store.currentStepIndex, occasion.sections.length - 1);
    trackEvent("wizard_step_reached", { occasion: occasion.id, step: occasion.sections[idx].id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedResume, showResumeBanner, store.currentStepIndex, occasion.id]);

  // A fresh step starts with a clean slate — don't carry over "you missed
  // this field" errors from whatever step the person was just on.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time reset of transient UI state (validation messages) whenever the step itself changes, not a value derivable during render.
    setShowErrors(false);
  }, [store.currentStepIndex]);

  if (!checkedResume) return null;

  if (showResumeBanner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFAF7] px-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-4xl">{occasion.icon}</p>
          <h2 className="font-display mt-4 text-xl font-semibold text-[#241A17]">
            Continue creating your surprise?
          </h2>
          <p className="mt-2 text-sm text-black/55">
            You were on step {store.currentStepIndex + 1} of your {occasion.title.toLowerCase()} gift.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={() => setShowResumeBanner(false)}>Continue</Button>
            <Button
              variant="secondary"
              onClick={() => {
                store.startOccasion(occasion.id);
                setShowResumeBanner(false);
              }}
            >
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sections = occasion.sections;
  const stepIndex = Math.min(store.currentStepIndex, sections.length - 1);
  const section = sections[stepIndex];
  const sectionValues = store.values[section.id] ?? {};
  const complete = isSectionComplete(section, sectionValues);
  const isLastStep = stepIndex === sections.length - 1;
  function requireComplete(action: () => void) {
    if (!complete) {
      setShowErrors(true);
      return;
    }
    action();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFAF7]">
      <ProgressBar steps={sections.map((s) => s.stepLabel)} currentIndex={stepIndex} />

      <div className="flex-1 px-4 py-10 sm:py-14">
        <div className="mx-auto flex max-w-5xl items-start justify-center gap-6 md:gap-10">
          <div className="w-full min-w-0 max-w-2xl">
            <AnimatePresence mode="wait">
              <SectionForm
                key={section.id}
                section={section}
                values={sectionValues}
                showErrors={showErrors}
                onFieldChange={(fieldId, value) => store.setFieldValue(section.id, fieldId, value)}
              />
            </AnimatePresence>
            {/* No per-step price display — the total is shown exactly once,
                on the final summary page (spec ask: no price mentioned
                mid-wizard). */}
          </div>
          <LivePreviewPanel
            occasion={occasion}
            section={section}
            values={store.values}
            themeId={str(store.values["theme"]?.themeId, occasion.accentTheme)}
          />
        </div>
      </div>

      {/* Sticky bottom nav — mobile-first (spec section 64). On the final
          step there are two CTAs instead of one (Preview + Create My Gift),
          so the "Saved" indicator hides below `sm` and button labels shrink
          to keep everything on one line at 390px-wide viewports. */}
      <div className="sticky bottom-0 z-20 border-t border-black/5 bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => store.prevStep()} disabled={stepIndex === 0}>
            Back
          </Button>

          <AnimatePresence mode="wait">
            <motion.span
              key={store.lastSavedAt ?? "unsaved"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-xs text-black/35 ${isLastStep ? "hidden sm:inline" : ""}`}
            >
              {store.lastSavedAt ? "Saved" : ""}
            </motion.span>
          </AnimatePresence>

          {isLastStep ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => requireComplete(() => router.push(`/create/${occasion.id}/preview`))}
                className="whitespace-nowrap px-4"
              >
                Preview
              </Button>
              <Button
                onClick={() => requireComplete(() => router.push(`/create/${occasion.id}/summary`))}
                className="whitespace-nowrap px-4"
              >
                <span className="hidden sm:inline">Create My Gift</span>
                <span className="sm:hidden">Create Gift</span>
              </Button>
            </div>
          ) : (
            <Button onClick={() => requireComplete(() => store.nextStep(sections.length - 1))}>Continue</Button>
          )}
        </div>
      </div>
    </div>
  );
}
