import type { GiftSectionConfig, OccasionDefinition } from "@/types/gift";
import {
  recipientSection,
  fromYouSection,
  themeSection,
  wrapSection,
  welcomeSection,
  moodSection,
  memoriesSection,
  gameSection,
  wishesSection,
  scratchSection,
  letterSection,
} from "./sections";

// ---------------------------------------------------------------------------
// Occasion-unique sections (not shared across flows)
// ---------------------------------------------------------------------------

const cakeSection: GiftSectionConfig = {
  id: "cake",
  type: "cake",
  title: "Choose a Cake",
  description: "The cake they'll blow candles on.",
  stepLabel: "Cake",
  fields: [
    {
      id: "cakeId",
      type: "cake-picker",
      label: "Cake",
      required: true,
      options: [
        { value: "cake-classic-pink", label: "Classic Pink", description: "Soft strawberry sponge with pink buttercream." },
        { value: "cake-chocolate", label: "Chocolate", description: "Rich, deep chocolate — a classic favorite." },
        { value: "cake-vanilla-cream", label: "Vanilla Cream", description: "Light vanilla sponge with silky cream." },
        { value: "cake-rainbow-funfetti", label: "Rainbow Funfetti", description: "Colorful sprinkles baked right in — pure fun." },
        { value: "cake-red-velvet", label: "Red Velvet", description: "Velvety red sponge with cream-cheese frosting." },
      ],
    },
  ],
  isPricingRelevant: true,
  pricingKey: "addon",
  recipientComponent: "cake",
};

const toastSection: GiftSectionConfig = {
  id: "toast",
  type: "toast",
  title: "Choose a Toast",
  description: "A little clink to celebrate your years together.",
  stepLabel: "Toast",
  fields: [
    {
      id: "toastId",
      type: "select",
      label: "Toast",
      options: [
        { value: "champagne", label: "Champagne", description: "The original golden champagne clink." },
        { value: "rose", label: "Rosé", description: "A soft pink rosé toast." },
        { value: "red-wine", label: "Red Wine", description: "A deep, romantic red wine clink." },
        { value: "sparkling-blue", label: "Sparkling Blue" },
      ],
    },
  ],
  recipientComponent: "toast",
};

const milestonesSection: GiftSectionConfig = {
  id: "story",
  type: "timeline",
  title: "Tell Your Story",
  description: "The milestones that made your relationship.",
  stepLabel: "Story",
  fields: [
    { id: "milestones", type: "milestone-list", label: "Milestones", helpText: "Each with a label, date, note, and optional photo." },
  ],
  recipientComponent: "timeline",
};

const thenVsNowSection: GiftSectionConfig = {
  id: "then-vs-now",
  type: "then-vs-now",
  title: "Then vs Now",
  description: "A visual comparison of where you started and where you are now.",
  stepLabel: "Then/Now",
  fields: [
    { id: "thenPhoto", type: "media-upload", label: "Then Photo", maxItems: 1, mediaAccept: ["image"] },
    { id: "nowPhoto", type: "media-upload", label: "Now Photo", maxItems: 1, mediaAccept: ["image"] },
    { id: "thenLabel", type: "text", label: "Then Caption", maxLength: 60 },
    { id: "nowLabel", type: "text", label: "Now Caption", maxLength: 60 },
  ],
  recipientComponent: "then-vs-now",
};

const promiseSection: GiftSectionConfig = {
  id: "promise",
  type: "pledge",
  title: "Renew a Promise",
  description: "A romantic promise, renewed.",
  stepLabel: "Promise",
  fields: [{ id: "promiseText", type: "textarea", label: "Your Promise", maxLength: 400 }],
  recipientComponent: "promise",
};

const ringSection: GiftSectionConfig = {
  id: "ring",
  type: "ring",
  title: "Choose the Ring",
  description: "The ring they'll see in the final, biggest moment.",
  stepLabel: "Ring",
  fields: [
    { id: "ringImage", type: "media-upload", label: "Ring Photo (optional)", maxItems: 1, mediaAccept: ["image"] },
    { id: "proposalQuestion", type: "text", label: "The Question", placeholder: "Will you marry me?", maxLength: 120 },
  ],
  recipientComponent: "ring",
};

const jarOfReasonsSection: GiftSectionConfig = {
  id: "jar-of-reasons",
  type: "jar-of-reasons",
  title: "A Jar of Reasons",
  description: "Little reasons why you love them, tucked into a jar.",
  stepLabel: "Reasons",
  fields: [
    { id: "reasons", type: "list", label: "Reasons", maxItems: 20, helpText: "Short, one line each." },
  ],
  recipientComponent: "jar-of-reasons",
};

const apologyGiftSection: GiftSectionConfig = {
  id: "apology-gift",
  type: "apology-gift",
  title: "The Apology Gift",
  description: "A small gesture to start making things right.",
  stepLabel: "Gift",
  fields: [
    {
      id: "giftType",
      type: "select",
      label: "Apology Gift",
      options: [
        { value: "sorry-cat", label: "Sorry Cat GIF", description: "A cute crying cat to melt their heart." },
        { value: "teddy-bear", label: "Teddy Bear", description: "A soft, comforting hug in a box." },
        { value: "flower-bouquet", label: "Flower Bouquet", description: "A beautiful arrangement of fresh flowers." },
        { value: "gourmet-chocolates", label: "Gourmet Chocolates", description: "Sweet treats to make things right." },
      ],
    },
  ],
  recipientComponent: "apology-gift",
};

const sorryLetterSection: GiftSectionConfig = {
  id: "sorry-letter",
  type: "sorry-letter",
  title: "Your Sorry Letter",
  description: "Say what's in your heart.",
  stepLabel: "Sorry",
  fields: [{ id: "sorryMessage", type: "textarea", label: "Your Message", maxLength: 800, required: true }],
  recipientComponent: "sorry-letter",
};

const brokenHeartSection: GiftSectionConfig = {
  id: "broken-heart",
  type: "broken-heart",
  title: "The Broken Heart",
  description: "An interactive moment where the heart slowly mends.",
  stepLabel: "Heal",
  fields: [],
  recipientComponent: "broken-heart",
};

const letItGoSection: GiftSectionConfig = {
  id: "let-it-go",
  type: "let-it-go",
  title: "Let It Go",
  description: "An emotional release before moving forward together.",
  stepLabel: "Let Go",
  fields: [],
  recipientComponent: "let-it-go",
};

const pledgeSection: GiftSectionConfig = {
  id: "pledge",
  type: "pledge",
  title: "Your Pledge",
  description: "A promise for how things will be different.",
  stepLabel: "Pledge",
  fields: [{ id: "pledgeText", type: "textarea", label: "Your Pledge", maxLength: 400 }],
  recipientComponent: "pledge",
};

const celebrationElementsSection: GiftSectionConfig = {
  id: "celebration",
  type: "celebration",
  title: "Add a Celebration",
  description: "Pick one or more interactive celebration moments.",
  stepLabel: "Celebration",
  fields: [
    {
      id: "elements",
      type: "toggle-group",
      label: "Celebration Elements",
      options: [
        { value: "cake", label: "Celebration Cake", description: "Blow out candles." },
        { value: "fireworks", label: "Fireworks", description: "Tap to launch rockets." },
        { value: "flower", label: "Blooming Flower", description: "Hold to unfold petals." },
        { value: "trophy", label: "Trophy", description: "Tap to raise." },
        { value: "champagne", label: "Champagne Toast", description: "Clink glasses." },
        { value: "ring-box", label: "Ring Box", description: "Press and hold to open." },
        { value: "heart-heal", label: "Heart Heal", description: "Hold to mend a cracked heart." },
      ],
    },
  ],
  recipientComponent: "celebration",
};

// ---------------------------------------------------------------------------
// Occasion definitions — the single source of truth the wizard, pricing,
// preview, and recipient playback engine all read from. Adding an occasion
// is adding an entry here (spec section 29/76) — no other file should need
// occasion-specific branching for the common flow shape.
// ---------------------------------------------------------------------------

export const OCCASIONS: OccasionDefinition[] = [
  {
    id: "birthday",
    title: "Birthday",
    tagline: "Make their next birthday unforgettable.",
    description: "An interactive birthday surprise with a cake, memories, games, and a letter.",
    icon: "🎂",
    accentTheme: "party",
    enabled: true,
    sections: [
      recipientSection({ nameLabel: "Birthday Person's Name", dateLabel: "Date of Birthday", dateFieldId: "birthDate", title: "Who is this for?" }),
      fromYouSection(),
      themeSection(),
      wrapSection(),
      cakeSection,
      welcomeSection(),
      moodSection(),
      memoriesSection(),
      gameSection(),
      wishesSection(),
      scratchSection(),
      letterSection(),
    ],
    recipientFlow: [
      // "birthday-reveal" now renders the birthday message, countdown, and
      // cake/candle interaction together as one stage (BirthdayCakeStage) —
      // "cake" is no longer a separate stage. "unlock" is handled by the
      // dedicated PIN gate before this flow ever starts, not by a stage here.
      "unlock", "welcome", "birthday-reveal",
      "memories", "game", "wishes", "scratch", "letter", "end",
    ],
  },
  {
    id: "anniversary",
    title: "Anniversary",
    tagline: "Celebrate every year, one beautiful story.",
    description: "A romantic journey through your milestones, memories, and a renewed promise.",
    icon: "💍",
    accentTheme: "romantic-sunset",
    enabled: true,
    sections: [
      recipientSection({ nameLabel: "Partner's Name", dateLabel: "Anniversary Date", dateFieldId: "anniversaryDate" }),
      fromYouSection(),
      themeSection(),
      wrapSection(),
      toastSection,
      welcomeSection(),
      moodSection(),
      milestonesSection,
      thenVsNowSection,
      memoriesSection(),
      wishesSection(),
      gameSection(),
      promiseSection,
      letterSection(),
    ],
    recipientFlow: [
      "unlock", "welcome", "toast", "timeline", "then-vs-now",
      "memories", "game", "promise", "letter", "end",
    ],
  },
  {
    id: "proposal",
    title: "Proposal",
    tagline: "Ask the biggest question, unforgettably.",
    description: "A slow, emotional build-up ending in the proposal moment.",
    icon: "💎",
    accentTheme: "starlight-love",
    enabled: true,
    sections: [
      recipientSection({ nameLabel: "Who are you asking?" }),
      fromYouSection(),
      themeSection(),
      wrapSection(),
      ringSection,
      welcomeSection(),
      moodSection(),
      milestonesSection,
      thenVsNowSection,
      memoriesSection(),
      jarOfReasonsSection,
      gameSection(),
      letterSection(),
    ],
    recipientFlow: [
      "unlock", "welcome", "timeline", "memories", "jar-of-reasons",
      "game", "build-up", "ring", "proposal-finale", "letter", "end",
    ],
  },
  {
    id: "apology",
    title: "Apology",
    tagline: "Say sorry in a way words alone can't.",
    description: "A heartfelt apology experience that heals as it unfolds.",
    icon: "🕊️",
    accentTheme: "frost",
    enabled: true,
    sections: [
      recipientSection({ nameLabel: "Who is this for?" }),
      fromYouSection(),
      themeSection(),
      wrapSection(),
      apologyGiftSection,
      sorryLetterSection,
      moodSection(),
      brokenHeartSection,
      memoriesSection(),
      letItGoSection,
      gameSection(),
      pledgeSection,
      letterSection(),
    ],
    recipientFlow: [
      "unlock", "welcome", "apology-gift", "broken-heart", "memories",
      "let-it-go", "game", "pledge", "letter", "end",
    ],
  },
  {
    id: "custom",
    title: "Custom Wishes",
    tagline: "Any moment, made magical.",
    description: "A flexible celebration you shape with your own interactive elements.",
    icon: "✨",
    accentTheme: "sparkle-hearts",
    enabled: true,
    sections: [
      recipientSection({ nameLabel: "Who is this for?" }),
      fromYouSection(),
      themeSection(),
      celebrationElementsSection,
      moodSection(),
      memoriesSection(),
      gameSection(),
      wishesSection(),
      scratchSection(),
      letterSection(),
    ],
    // The recipient flow for custom is dynamically derived at runtime from
    // the `elements` selected in the celebration section — see
    // lib/recipientFlow.ts (buildCustomFlow). This static array is the
    // fallback default ordering used only for preview-with-no-data.
    recipientFlow: [
      "unlock", "welcome", "celebration", "memories", "game", "wishes", "scratch", "letter", "end",
    ],
  },
  {
    id: "congratulations",
    title: "Congratulations",
    tagline: "Celebrate their big win.",
    description: "A joyful, celebratory surprise for graduations, promotions, and achievements.",
    icon: "🏆",
    accentTheme: "party",
    enabled: true,
    sections: [
      recipientSection({ nameLabel: "Who is this for?" }),
      fromYouSection(),
      themeSection(),
      wrapSection(),
      welcomeSection(),
      moodSection(),
      memoriesSection(),
      wishesSection(),
      gameSection(),
      letterSection(),
    ],
    recipientFlow: ["unlock", "welcome", "trophy-reveal", "memories", "game", "wishes", "letter", "end"],
  },
  {
    id: "festival",
    title: "Festival Wishes",
    tagline: "Share the light of the season.",
    description: "A festive, celebratory gift for any holiday or festival.",
    icon: "🪔",
    accentTheme: "classic-gold",
    enabled: true,
    sections: [
      recipientSection({ nameLabel: "Who is this for?" }),
      fromYouSection(),
      themeSection(),
      wrapSection(),
      welcomeSection(),
      moodSection(),
      memoriesSection(),
      wishesSection(),
      letterSection(),
    ],
    recipientFlow: ["unlock", "welcome", "festival-reveal", "memories", "wishes", "letter", "end"],
  },
  {
    id: "family",
    title: "Family Love",
    tagline: "For the people who raised and shaped you.",
    description: "A warm, heartfelt tribute to family — parents, siblings, or the whole family.",
    icon: "❤️",
    accentTheme: "two-hearts",
    enabled: true,
    sections: [
      recipientSection({ nameLabel: "Who is this for?" }),
      fromYouSection(),
      themeSection(),
      wrapSection(),
      welcomeSection(),
      moodSection(),
      milestonesSection,
      memoriesSection(),
      wishesSection(),
      letterSection(),
    ],
    recipientFlow: ["unlock", "welcome", "timeline", "memories", "wishes", "letter", "end"],
  },
];

export function getOccasion(id: string): OccasionDefinition | undefined {
  return OCCASIONS.find((o) => o.id === id);
}

export function getEnabledOccasions(): OccasionDefinition[] {
  return OCCASIONS.filter((o) => o.enabled);
}
