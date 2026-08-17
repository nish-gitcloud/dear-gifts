"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOccasion } from "@/config/occasions";
import { useWizardStore } from "@/hooks/useWizardStore";
import { mergeWithDemoData } from "@/lib/demoData";
import { trackEvent } from "@/lib/analyticsClient";
import { RecipientExperience } from "@/components/recipient/RecipientExperience";

/**
 * Preview Mode (spec section 30): shows the exact recipient experience, but
 * clearly marked, never activates a paid gift, and falls back to demo data
 * for anything the creator hasn't filled in yet.
 */
export default function PreviewPage({ params }: { params: Promise<{ occasion: string }> }) {
  const { occasion: occasionId } = use(params);
  const occasion = getOccasion(occasionId);
  const store = useWizardStore();

  useEffect(() => {
    if (occasion) trackEvent("preview_reached", { occasion: occasion.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occasion?.id]);

  if (!occasion) notFound();

  const values = mergeWithDemoData(occasion.id, store.values);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-black px-4 py-2 text-xs text-white">
        <span className="font-semibold uppercase tracking-wide">Preview Mode — not a live gift</span>
        <Link href={`/create/${occasion.id}`} className="underline opacity-80 hover:opacity-100">
          Back to editing
        </Link>
      </div>
      <div className="pt-8">
        <RecipientExperience occasion={occasion} values={values} skipUnlock={false} />
      </div>
    </div>
  );
}
