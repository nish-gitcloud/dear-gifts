import type { Metadata } from "next";
import { getEffectiveEnabledOccasions } from "@/lib/occasionSettings";
import { OccasionCard } from "@/components/creator/OccasionCard";

export const metadata: Metadata = {
  title: "Occasions — Dear Gifts",
  description:
    "Every occasion on Dear Gifts has its own emotional journey — Birthday, Anniversary, Proposal, Apology, Custom Wishes, Congratulations, Festival Wishes, and Family Love.",
};

export default async function OccasionsPage() {
  const occasions = await getEffectiveEnabledOccasions();

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">Occasions</p>
      <h1 className="font-display mt-3 max-w-2xl text-3xl font-semibold text-[#241A17] sm:text-5xl">
        A different journey for every moment.
      </h1>
      <p className="mt-4 max-w-2xl text-base text-black/60">
        Each occasion isn&apos;t a template with swapped colors — it&apos;s its own creation flow and its own
        recipient experience, built around what that moment actually feels like.
      </p>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {occasions.map((occasion, i) => (
          <OccasionCard key={occasion.id} occasion={occasion} index={i} />
        ))}
      </div>
    </main>
  );
}
