import type { OccasionId } from "@/types/gift";

/**
 * Beautiful default demo content used by Preview Mode whenever the creator
 * hasn't filled a field in yet (spec section 30). Keyed by section id so it
 * merges naturally with whatever the creator HAS entered — real data always
 * wins, demo data only fills the gaps.
 */
export const DEMO_DATA: Record<OccasionId, Record<string, Record<string, unknown>>> = {
  birthday: {
    recipient: { recipientName: "Cutiepiee", birthDate: "2006-08-14", secretPin: "1234", pinHint: "Our favourite number" },
    "from-you": { creatorName: "Me", creatorPhone: "+91 90000 00000" },
    theme: { themeId: "party" },
    "gift-wrap": { wrapId: "box-royal-gold" },
    cake: { cakeId: "cake-red-velvet" },
    welcome: { introTitle: "Something special awaits you...", introSubtitle: "I made a little world just for you." },
    mood: { musicSource: "dooron-dooron" },
    memories: { layout: "polaroid", media: [] },
    game: { gameId: "sliding-puzzle" },
    wishes: { wishes: ["May this year bring you endless laughter.", "Never stop chasing what makes you glow."] },
    scratch: { scratchTitle: "One more thing...", scratchMessage: "You make every day brighter just by being you." },
    letter: {
      greeting: "My dearest Cutiepiee,",
      body: "I still remember the first time we met.\nEvery year with you feels like a gift in itself.\nHappy birthday — here's to many more.",
      signOff: "Forever yours,",
    },
  },
  anniversary: {
    recipient: { recipientName: "My Love", anniversaryDate: "2018-03-14", secretPin: "1234" },
    "from-you": { creatorName: "Me", creatorPhone: "+91 90000 00000" },
    theme: { themeId: "romantic-sunset" },
    "gift-wrap": { wrapId: "scroll-rose-blush" },
    toast: { toastId: "champagne" },
    welcome: { introTitle: "To us...", introSubtitle: "Every year, a little more in love." },
    story: { milestones: [{ label: "We met", date: "2018-03-14", note: "The day everything changed." }] },
    "then-vs-now": { thenLabel: "Then", nowLabel: "Now" },
    memories: { layout: "cinema", media: [] },
    wishes: { wishes: ["Here's to forever."] },
    game: { gameId: "memory-match" },
    promise: { promiseText: "I promise to keep choosing you, every single day." },
    letter: { greeting: "My love,", body: "Another year, another chapter.\nI'd choose you every time.", signOff: "Always yours," },
  },
  proposal: {
    recipient: { recipientName: "My Love", secretPin: "1234" },
    "from-you": { creatorName: "Me", creatorPhone: "+91 90000 00000" },
    theme: { themeId: "starlight-love" },
    "gift-wrap": { wrapId: "chest-royal-mahogany" },
    ring: { proposalQuestion: "Will you marry me?" },
    welcome: { introTitle: "There's something I need to ask you...", introSubtitle: "" },
    story: { milestones: [] },
    "then-vs-now": {},
    memories: { layout: "cinema", media: [] },
    "jar-of-reasons": { reasons: ["Your laugh", "How you make everything feel like home"] },
    game: { gameId: "sliding-puzzle" },
    letter: { greeting: "My love,", body: "From the moment I met you, I knew.", signOff: "Forever," },
  },
  apology: {
    recipient: { recipientName: "My Love", secretPin: "1234" },
    "from-you": { creatorName: "Me", creatorPhone: "+91 90000 00000" },
    theme: { themeId: "frost" },
    "gift-wrap": { wrapId: "envelope-classic-cream" },
    "apology-gift": { giftType: "flower-bouquet" },
    "sorry-letter": { sorryMessage: "I'm sorry for what I said. You deserve better from me." },
    mood: { musicSource: "dooron-dooron" },
    memories: { layout: "polaroid", media: [] },
    game: { gameId: "memory-match" },
    pledge: { pledgeText: "I promise to listen more and react less." },
    letter: { greeting: "I'm sorry,", body: "I hope we can make something beautiful again.", signOff: "With love," },
  },
  custom: {
    recipient: { recipientName: "Friend", secretPin: "1234" },
    "from-you": { creatorName: "Me", creatorPhone: "+91 90000 00000" },
    theme: { themeId: "sparkle-hearts" },
    celebration: { elements: ["cake", "fireworks"] },
    mood: {},
    memories: { layout: "scrapbook", media: [] },
    game: { gameId: "sliding-puzzle" },
    wishes: { wishes: ["Wishing you all the best!"] },
    scratch: { scratchTitle: "Surprise!", scratchMessage: "Hope this made you smile." },
    letter: { greeting: "Hey!", body: "Just wanted to make your day a little brighter.", signOff: "Take care," },
  },
  congratulations: {
    recipient: { recipientName: "Star", secretPin: "1234" },
    "from-you": { creatorName: "Me", creatorPhone: "+91 90000 00000" },
    theme: { themeId: "party" },
    "gift-wrap": { wrapId: "box-rainbow-pop" },
    welcome: { introTitle: "You did it!", introSubtitle: "So proud of you." },
    memories: { layout: "polaroid", media: [] },
    wishes: { wishes: ["Congratulations on this huge win!"] },
    game: { gameId: "sliding-puzzle" },
    letter: { greeting: "Congratulations!", body: "All your hard work paid off.", signOff: "Proud of you," },
  },
  festival: {
    recipient: { recipientName: "Friend", secretPin: "1234" },
    "from-you": { creatorName: "Me", creatorPhone: "+91 90000 00000" },
    theme: { themeId: "classic-gold" },
    "gift-wrap": { wrapId: "chest-classic-oak" },
    welcome: { introTitle: "Celebrating you this season.", introSubtitle: "" },
    memories: { layout: "scrapbook", media: [] },
    wishes: { wishes: ["Wishing you light and joy."] },
    letter: { greeting: "Dear friend,", body: "Wishing you a season full of joy.", signOff: "With warmth," },
  },
  family: {
    recipient: { recipientName: "Family", secretPin: "1234" },
    "from-you": { creatorName: "Me", creatorPhone: "+91 90000 00000" },
    theme: { themeId: "two-hearts" },
    "gift-wrap": { wrapId: "envelope-rose-gold" },
    welcome: { introTitle: "For my family.", introSubtitle: "" },
    story: { milestones: [] },
    memories: { layout: "scrapbook", media: [] },
    wishes: { wishes: ["Grateful for every one of you."] },
    letter: { greeting: "Dear family,", body: "Everything I am, I owe to you.", signOff: "With all my love," },
  },
};

export function getDemoData(occasion: OccasionId) {
  return DEMO_DATA[occasion] ?? {};
}

/** Merges creator-entered values over demo defaults, per section. */
export function mergeWithDemoData(
  occasion: OccasionId,
  values: Record<string, Record<string, unknown>>
): Record<string, Record<string, unknown>> {
  const demo = getDemoData(occasion);
  const merged: Record<string, Record<string, unknown>> = {};
  const sectionIds = new Set([...Object.keys(demo), ...Object.keys(values)]);
  for (const id of sectionIds) {
    merged[id] = { ...(demo[id] ?? {}), ...(values[id] ?? {}) };
  }
  return merged;
}
