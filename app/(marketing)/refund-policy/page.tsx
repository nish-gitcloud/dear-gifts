import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — Dear Gifts",
  description: "When and how refunds are issued for Dear Gifts purchases.",
};

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">Legal</p>
      <h1 className="font-display mt-3 text-3xl font-semibold text-[#241A17] sm:text-5xl">Refund Policy</h1>
      <p className="mt-3 text-sm text-black/45">Last updated: 2026</p>

      <div className="mt-12 space-y-8 text-sm leading-relaxed text-black/70">
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">Digital goods</h2>
          <p className="mt-2">
            Because each gift is a personalized digital experience activated immediately after payment, purchases are
            generally non-refundable once a gift has been successfully created and its link has been generated.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">When we do issue a refund</h2>
          <p className="mt-2">
            We&apos;ll issue a full refund if a payment was captured but your gift was never activated due to a
            technical fault on our end, if you were charged more than once for the same gift, or if a payment was
            made in error and reported to us within 24 hours before the gift link was ever opened by the recipient.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">How to request one</h2>
          <p className="mt-2">
            Contact us at{" "}
            <a href="mailto:billing@deargifts.app" className="text-[#E85C7B] underline">
              billing@deargifts.app
            </a>{" "}
            or via the{" "}
            <a href="/contact" className="text-[#E85C7B] underline">
              contact page
            </a>{" "}
            with your payment reference. We aim to resolve refund requests within 5–7 business days.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-[#241A17]">Failed payments</h2>
          <p className="mt-2">
            If a payment fails or is declined, your gift is never activated and you are not charged — you&apos;re
            free to try again.
          </p>
        </section>
      </div>
    </main>
  );
}
