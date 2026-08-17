import type { Metadata } from "next";
import { getGiftByToken } from "@/lib/giftRepo";
import { getOccasion } from "@/config/occasions";
import { generateSessionId } from "@/lib/token";
import { recordGiftOpened } from "@/lib/analyticsRepo";
import { GiftPageClient } from "@/components/recipient/GiftPageClient";

// Private gift URLs should never be indexed (spec section 62).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function GiftPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const gift = await getGiftByToken(token);

  if (!gift) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFFAF7] px-6 text-center">
        <span className="text-5xl">🔍</span>
        <h1 className="font-display mt-4 text-xl font-semibold text-[#241A17]">We couldn&apos;t find this gift.</h1>
        <p className="mt-2 text-sm text-black/55">Double check the link you were sent.</p>
      </main>
    );
  }

  const expired =
    gift.status === "expired" || (gift.expiresAt !== null && new Date(gift.expiresAt) < new Date());
  if (expired) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#241A17] px-6 text-center text-white">
        <span className="text-5xl">🕊️</span>
        <h1 className="font-display mt-4 text-xl font-semibold">This little surprise has completed its journey.</h1>
      </main>
    );
  }

  if (gift.status !== "active") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFFAF7] px-6 text-center">
        <span className="text-5xl">⏳</span>
        <h1 className="font-display mt-4 text-xl font-semibold text-[#241A17]">This gift isn&apos;t ready yet.</h1>
      </main>
    );
  }

  const occasion = getOccasion(gift.occasion)!;
  const values: Record<string, Record<string, unknown>> = {
    ...gift.sections,
    recipient: { ...gift.sections.recipient, recipientName: gift.recipientName, pinHint: gift.pinHint },
    theme: { themeId: gift.theme },
    "gift-wrap": { wrapId: gift.giftWrap },
  };

  // One analytics session per page load (spec section 58: "gift opened").
  // Minted here, server-side, and threaded down to the client so every
  // later event from this visit (stage completed, watch again) lands on
  // the same gift_views row instead of creating a new one each time.
  const sessionId = generateSessionId();
  await recordGiftOpened(gift.id, sessionId);

  return <GiftPageClient token={token} occasion={occasion} values={values} sessionId={sessionId} />;
}
