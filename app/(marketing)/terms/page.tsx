import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Dear Gifts",
  description: "The terms that govern your use of Dear Gifts to create and send digital gifts.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">Legal</p>
      <h1 className="font-display mt-3 text-3xl font-semibold text-[#241A17] sm:text-5xl">Terms of Service</h1>
      <p className="mt-3 text-sm text-black/45">Last updated: 2026</p>

      <div className="mt-12 space-y-8 text-sm leading-relaxed text-black/70">
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">1. Using Dear Gifts</h2>
          <p className="mt-2">
            Dear Gifts lets you build a personalized, interactive digital gift and share it with someone via a
            private link protected by a secret code. By using the service, you agree to provide accurate information
            and to use it only for lawful, non-abusive purposes.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">2. Content you upload</h2>
          <p className="mt-2">
            You retain ownership of the photos, videos, voice notes, and text you upload. You&apos;re responsible for
            making sure you have the right to share anything you upload, and for the accuracy and appropriateness of
            the content you include. We reserve the right to remove content that violates these terms or applicable
            law.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">3. Payment and activation</h2>
          <p className="mt-2">
            A gift is created in a pending state and is only activated — made reachable to the recipient — after
            payment is successfully verified. Prices shown at checkout reflect our current pricing at the time of
            purchase and may change for future gifts.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">4. Gift expiry</h2>
          <p className="mt-2">
            Gifts remain active for a limited period after payment (30 days by default) and then expire. We&apos;re
            not responsible for a recipient&apos;s inability to access a gift after its expiry window has passed.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">5. Account and guest access</h2>
          <p className="mt-2">
            You can use Dear Gifts with or without creating an account. If you create a gift as a guest, your
            management link is the only way to edit or duplicate that gift — keep it safe, as we cannot recover a
            lost management link without other proof of purchase.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">6. Limitation of liability</h2>
          <p className="mt-2">
            Dear Gifts is provided &quot;as is.&quot; We work hard to keep the service reliable and your data secure,
            but we don&apos;t guarantee uninterrupted availability and aren&apos;t liable for indirect or
            consequential damages arising from use of the service, to the fullest extent permitted by law.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">7. Changes to these terms</h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of Dear Gifts after changes take effect
            constitutes acceptance of the updated terms.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">8. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Reach us via the{" "}
            <a href="/contact" className="text-[#E85C7B] underline">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
