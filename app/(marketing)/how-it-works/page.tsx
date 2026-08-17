import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How It Works — Dear Gifts",
  description:
    "See exactly how Dear Gifts turns your memories and words into a private, interactive digital surprise — from choosing an occasion to the moment they open it.",
};

const STEPS = [
  {
    title: "Choose an occasion",
    detail:
      "Birthday, Anniversary, Proposal, Apology, Custom Wishes, Congratulations, Festival Wishes, or Family Love — each one opens its own creation flow built specifically for that moment.",
  },
  {
    title: "Personalize every detail",
    detail:
      "Pick a theme and gift wrap, then fill in short prompts — their name, your words, a few dates and choices. Nothing generic: every section maps to something the recipient will actually see.",
  },
  {
    title: "Add real memories",
    detail:
      "Upload photos, short videos, or a voice note. They're stored securely and woven into the experience — a memory wall, a then-vs-now comparison, or a puzzle built from your own photo, depending on the occasion.",
  },
  {
    title: "Preview before you pay",
    detail:
      "Preview Mode shows you the exact recipient experience, end to end, with placeholder content standing in for anything you haven't filled in yet. Nothing is created or charged until you're happy with it.",
  },
  {
    title: "Pay & create",
    detail:
      "Your gift is only ever activated after payment is verified — never before. You'll instantly get a private link, a QR code, and a secure management link to edit small details or duplicate the gift later.",
  },
  {
    title: "Share the magic",
    detail:
      "Send the link and let them know the secret 4-digit code (or a hint, if you left one). They open it on any phone or laptop, enter the code, and the experience unfolds one moment at a time.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">How It Works</p>
      <h1 className="font-display mt-3 text-3xl font-semibold text-[#241A17] sm:text-5xl">
        From an idea to a moment they&apos;ll remember.
      </h1>
      <p className="mt-4 max-w-2xl text-base text-black/60">
        Dear Gifts isn&apos;t a card or a video — it&apos;s a private, interactive experience built entirely from
        your own words and memories. Here&apos;s exactly what happens between choosing an occasion and the moment
        they open it.
      </p>

      <ol className="mt-14 space-y-10">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-5">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#E85C7B]/10 font-display text-sm font-semibold text-[#E85C7B]">
              {i + 1}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-[#241A17]">{step.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-black/60">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 rounded-3xl bg-white p-8 text-center shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-[#241A17]">Ready to create yours?</h2>
        <p className="mt-2 text-sm text-black/55">It takes about ten minutes, and you can preview it for free.</p>
        <div className="mt-6">
          <Link href="/create">
            <Button size="lg">Create a Gift</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
