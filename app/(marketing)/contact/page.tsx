"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// Metadata can't be exported from a "use client" page — see layout.tsx's
// default title/description, or move this to a server wrapper if per-page
// SEO copy for /contact becomes important later.

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't send your message.");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-[#E85C7B]">Contact</p>
      <h1 className="font-display mt-3 text-3xl font-semibold text-[#241A17] sm:text-5xl">We&apos;re here to help</h1>
      <p className="mt-4 text-base text-black/60">
        Trouble with a gift, a payment question, or just want to say hello — send us a note and we&apos;ll get back
        to you. For anything urgent, email us directly at{" "}
        <a href="mailto:hello@deargifts.app" className="font-medium text-[#E85C7B] underline">
          hello@deargifts.app
        </a>
        .
      </p>

      {sent ? (
        <div className="mt-10 rounded-2xl bg-emerald-50 p-6 text-sm text-emerald-700">
          Thanks — your message has been sent. We usually reply within a day.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 space-y-4 rounded-3xl bg-white p-8 shadow-sm">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#241A17]">Your Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#241A17]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#241A17]">Message</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
            />
          </label>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      )}
    </main>
  );
}
