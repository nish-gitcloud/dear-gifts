import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Dear Gifts",
  description: "Answers to common questions about creating, sending, and managing a Dear Gifts surprise.",
};

const FAQS = [
  {
    q: "How does the recipient open their gift?",
    a: "You'll get a private link (and a QR code) right after payment. Send it however you like — WhatsApp, text, email. They open the link, enter the 4-digit secret code you set, and the experience begins.",
  },
  {
    q: "What if they forget the code?",
    a: "You can leave an optional hint they'll see on the unlock screen. If they still can't guess it, use your management link to remind yourself of the hint, or reach out and remind them directly — the code itself is never stored anywhere retrievable, even by us, since only its one-way hash is kept.",
  },
  {
    q: "How long does a gift stay active?",
    a: "By default, a gift stays live for 30 days after payment. After that it moves to an \"expired\" state — the recipient sees a gentle closing message instead of a broken link.",
  },
  {
    q: "Can I edit a gift after I've paid?",
    a: "Small corrections — a name, a PIN hint, letter or wish text, a photo caption — can be changed anytime from your management link. Bigger changes, like the theme, gift wrap, or an interactive game, require duplicating the gift into a new one, which needs its own payment.",
  },
  {
    q: "Do I need an account?",
    a: "No. You can create and manage a gift entirely as a guest using the secure management link you're given after payment. Creating a free account just makes it easier to see every gift you've made in one place.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. Payments are processed through Razorpay, and a gift is only ever activated after your payment is verified server-side — never based on what the checkout screen alone reports.",
  },
  {
    q: "What happens to the photos and videos I upload?",
    a: "They're uploaded securely to our media storage (Cloudinary) and linked only to your specific gift. They're never used for anything beyond powering that one gift's experience.",
  },
  {
    q: "Can I preview the gift before paying?",
    a: "Yes — Preview Mode shows you the full recipient experience end to end, using your real answers where you've filled them in and tasteful placeholders anywhere you haven't. Nothing is created or charged in preview.",
  },
  {
    q: "What if I entered the wrong secret code too many times?",
    a: "After 5 incorrect attempts, the gift locks for a short cooldown period to protect it from guessing. It unlocks automatically after a few minutes.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">FAQ</p>
      <h1 className="font-display mt-3 text-3xl font-semibold text-[#241A17] sm:text-5xl">Common questions</h1>

      <div className="mt-14 divide-y divide-black/5 rounded-2xl bg-white shadow-sm">
        {FAQS.map((item) => (
          <details key={item.q} className="group px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[#241A17]">
              {item.q}
              <span className="ml-4 text-black/30 transition-transform group-open:rotate-45">＋</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-black/60">{item.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
