import Link from "next/link";
import { getEnabledOccasions } from "@/config/occasions";
import { OccasionCard } from "@/components/creator/OccasionCard";
import { Button } from "@/components/ui/Button";

const HOW_IT_WORKS = [
  { icon: "🎈", title: "Choose an occasion", detail: "Birthday, anniversary, proposal, and more." },
  { icon: "🎨", title: "Personalize your surprise", detail: "Pick a theme, gift wrap, and interactive moments." },
  { icon: "📸", title: "Add memories", detail: "Photos, videos, and voice notes that tell your story." },
  { icon: "🎁", title: "Create your gift", detail: "Preview it, then bring it to life in a few taps." },
  { icon: "💌", title: "Share the magic", detail: "Send a private link and a secret code — that's it." },
];

const WHY = [
  { icon: "💝", title: "Personal", detail: "Every gift is built entirely from their memories and your words." },
  { icon: "🎮", title: "Interactive", detail: "Games, wishes, and surprises — not a static page." },
  { icon: "🔒", title: "Private", detail: "Protected by a secret PIN only they know." },
  { icon: "✨", title: "Made with Love", detail: "Designed to feel like a moment, not a message." },
];

export default function HomePage() {
  const occasions = getEnabledOccasions();

  return (
    <main className="flex-1 bg-[#FFFAF7] dark:bg-[#100B10]">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20 text-center sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_at_top,_rgba(232,92,123,0.14),_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(232,92,123,0.22),_transparent_60%)]"
        />
        <p className="font-display flex items-center justify-center gap-1.5 text-sm font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">
          <span aria-hidden>🎁</span> Dear Gifts
        </p>
        <h1 className="font-display mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight text-[#241A17] sm:text-6xl dark:text-[#F3ECE8]">
          Make Someone Feel Special.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-black/60 sm:text-lg dark:text-white/60">
          Turn your memories, wishes and feelings into an unforgettable digital surprise.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/create">
            <Button size="lg">✨ Create a Gift</Button>
          </Link>
          <Link href="/create/birthday/preview">
            <Button size="lg" variant="secondary">
              👀 Preview a Gift
            </Button>
          </Link>
        </div>
        <div className="mx-auto mt-12 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-black/45 dark:text-white/40">
          <span>🔒 PIN-protected</span>
          <span>🎉 8 occasions</span>
          <span>💳 Pay once, keep forever</span>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-display text-center text-3xl font-semibold text-[#241A17] dark:text-[#F3ECE8]">
          How it works
        </h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E85C7B]/10 text-xl dark:bg-[#E85C7B]/20">
                <span aria-hidden>{step.icon}</span>
              </div>
              <p className="font-display text-xs font-semibold text-[#E85C7B]">Step {i + 1}</p>
              <h3 className="mt-0.5 text-sm font-semibold text-[#241A17] dark:text-[#F3ECE8]">{step.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-black/55 dark:text-white/50">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Occasions */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold text-[#241A17] dark:text-[#F3ECE8]">
            Choose your occasion
          </h2>
          <p className="mt-3 text-sm text-black/55 dark:text-white/50">Every occasion has its own emotional journey.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {occasions.map((occasion, i) => (
            <OccasionCard key={occasion.id} occasion={occasion} index={i} />
          ))}
        </div>
      </section>

      {/* Why Dear Gifts */}
      <section className="bg-white px-6 py-20 dark:bg-[#150F15]">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-center text-3xl font-semibold text-[#241A17] dark:text-[#F3ECE8]">
            Why Dear Gifts?
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E85C7B]/10 text-xl dark:bg-[#E85C7B]/20">
                  <span aria-hidden>{item.icon}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-[#241A17] dark:text-[#F3ECE8]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/55 dark:text-white/50">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-24 text-center">
        <h2 className="font-display mx-auto max-w-2xl text-3xl font-semibold text-[#241A17] sm:text-4xl dark:text-[#F3ECE8]">
          Create Something They&apos;ll Never Forget. 💫
        </h2>
        <div className="mt-8">
          <Link href="/create">
            <Button size="lg">✨ Create a Gift</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
