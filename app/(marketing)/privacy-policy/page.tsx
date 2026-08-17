import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Dear Gifts",
  description: "How Dear Gifts collects, stores, and protects your data and the data of the people you send gifts to.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">Legal</p>
      <h1 className="font-display mt-3 text-3xl font-semibold text-[#241A17] sm:text-5xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-black/45">Last updated: 2026</p>

      <div className="prose-content mt-12 space-y-8 text-sm leading-relaxed text-black/70">
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">1. What we collect</h2>
          <p className="mt-2">
            When you create a gift, we collect what you type in (recipient name, your name, dates, messages, wishes),
            any photos, videos, or voice notes you upload, and the 4-digit secret code you choose — which we store
            only as a one-way cryptographic hash, never in plain text, so even we can&apos;t read it back. If you
            create an account, we also store your email address. If you don&apos;t, your gift is managed instead
            through a private, unguessable management link that only you have.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">2. What we don&apos;t collect</h2>
          <p className="mt-2">
            We never ask the recipient of a gift for an account or personal details beyond the secret code needed to
            open it. Payment card details are never seen or stored by us — they go directly to our payment
            processor, Razorpay.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">3. How we use your data</h2>
          <p className="mt-2">
            Your gift&apos;s content is used only to render that gift&apos;s experience for the recipient. We use
            basic, anonymized usage analytics (which step of creation you reached, whether a gift was opened, how far
            a recipient got) to understand and improve the product — this is never tied to the readable content of
            what you wrote.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">4. Third parties we rely on</h2>
          <p className="mt-2">
            We use Supabase for our database and authentication, Razorpay for payment processing, and Cloudinary for
            photo/video/audio storage. Each of these providers processes data solely to provide their respective
            service to us, under their own security and privacy commitments.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">5. How long we keep it</h2>
          <p className="mt-2">
            A gift and its content remain accessible for 30 days after payment by default, after which it&apos;s
            marked expired and is no longer viewable by the recipient. We may retain the underlying record for a
            limited additional period for support and fraud-prevention purposes before deletion.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">6. Your choices</h2>
          <p className="mt-2">
            You can edit or remove certain gift details at any time via your management link or account dashboard.
            To request deletion of your account or gift data entirely, contact us at{" "}
            <a href="mailto:privacy@deargifts.app" className="text-[#E85C7B] underline">
              privacy@deargifts.app
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">7. Contact</h2>
          <p className="mt-2">
            Questions about this policy? Reach us via the{" "}
            <a href="/contact" className="text-[#E85C7B] underline">
              contact page
            </a>{" "}
            or email{" "}
            <a href="mailto:privacy@deargifts.app" className="text-[#E85C7B] underline">
              privacy@deargifts.app
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
