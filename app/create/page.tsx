import { getEffectiveEnabledOccasions } from "@/lib/occasionSettings";
import { OccasionCard } from "@/components/creator/OccasionCard";

export const metadata = { title: "Choose your occasion — Dear Gifts" };

export default async function ChooseOccasionPage() {
  const occasions = await getEffectiveEnabledOccasions();

  return (
    <main className="min-h-screen bg-[#FFFAF7] px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">Step 1</p>
          <h1 className="font-display mt-3 text-3xl font-semibold text-[#241A17] sm:text-4xl">
            Choose your occasion
          </h1>
          <p className="mt-3 text-sm text-black/55">
            Every occasion unlocks its own creation flow and its own surprise for them.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {occasions.map((occasion, i) => (
            <OccasionCard key={occasion.id} occasion={occasion} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
