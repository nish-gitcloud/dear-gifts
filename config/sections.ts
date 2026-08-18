import type { GiftSectionConfig } from "@/types/gift";

/**
 * Reusable section builders (spec section 69/76: "Use reusable blocks").
 * Every occasion in config/occasions.ts composes its flow from these
 * functions instead of hand-rolling near-duplicate section definitions.
 * Adding a brand-new occasion is then just picking which blocks to include
 * and in what order — no new UI code required for the common cases.
 */

export function recipientSection(opts: {
  nameLabel: string;
  dateLabel?: string;
  dateFieldId?: string;
  stepLabel?: string;
  title?: string;
}): GiftSectionConfig {
  const fields: GiftSectionConfig["fields"] = [
    {
      id: "recipientName",
      type: "text",
      label: opts.nameLabel,
      placeholder: "Their name",
      required: true,
      maxLength: 60,
    },
  ];

  if (opts.dateLabel) {
    fields.push({
      id: opts.dateFieldId ?? "specialDate",
      type: "date",
      label: opts.dateLabel,
      required: true,
    });
  }

  fields.push(
    {
      id: "secretPin",
      type: "pin",
      label: "Create your secret code",
      helpText: "Exactly 4 digits — something only they would know.",
      required: true,
      validation: { pattern: "^\\d{4}$", message: "PIN must be exactly 4 digits." },
    },
    {
      id: "pinHint",
      type: "text",
      label: "PIN Hint (optional)",
      placeholder: "e.g. Our first date, in DDMM",
      maxLength: 80,
    }
  );

  return {
    id: "recipient",
    type: "recipient",
    title: opts.title ?? "Who is this little surprise for?",
    description: "Let's start with the most important part — them.",
    stepLabel: opts.stepLabel ?? "Recipient",
    fields,
    recipientComponent: "unlock",
  };
}

export function fromYouSection(): GiftSectionConfig {
  return {
    id: "from-you",
    type: "creator",
    title: "And who's it from?",
    description: "So they know exactly who made this for them.",
    stepLabel: "From You",
    fields: [
      { id: "creatorName", type: "text", label: "Your Name", required: true, maxLength: 60 },
      {
        id: "creatorPhone",
        type: "phone",
        label: "Your Phone Number",
        helpText: "High priority contact — used only to help recover or manage this gift, never shown to the recipient.",
        required: true,
      },
    ],
    recipientComponent: "welcome",
  };
}

export function themeSection(): GiftSectionConfig {
  return {
    id: "theme",
    type: "theme",
    title: "Pick a Theme",
    description: "This sets the entire mood — colors, motion, and feel.",
    stepLabel: "Theme",
    fields: [
      { id: "themeId", type: "theme-picker", label: "Theme", required: true },
    ],
    isPricingRelevant: true,
    pricingKey: "theme",
    recipientComponent: "theme", // applied globally, not a standalone stage
  };
}

export function wrapSection(): GiftSectionConfig {
  return {
    id: "gift-wrap",
    type: "wrap",
    title: "Pick a Gift Wrap",
    description: "How should it look right before they open it?",
    stepLabel: "Gift Wrap",
    fields: [
      { id: "wrapId", type: "wrap-picker", label: "Gift Wrap", required: true },
    ],
    isPricingRelevant: true,
    pricingKey: "wrap",
    recipientComponent: "unlock",
  };
}

export function welcomeSection(): GiftSectionConfig {
  return {
    id: "welcome",
    type: "welcome",
    title: "Their First Welcome",
    description: "The very first words they'll read after unlocking.",
    stepLabel: "Welcome",
    fields: [
      { id: "introTitle", type: "text", label: "Intro Title", placeholder: "Something special awaits you...", maxLength: 80 },
      { id: "introSubtitle", type: "text", label: "Intro Subtitle", placeholder: "I made a little world just for you.", maxLength: 120 },
    ],
    recipientComponent: "welcome",
  };
}

export function moodSection(): GiftSectionConfig {
  return {
    id: "mood",
    type: "music",
    title: "Set the Mood",
    description: "Music makes it unforgettable.",
    stepLabel: "Mood",
    fields: [
      {
        id: "musicSource",
        type: "mood-picker",
        label: "Background Music",
        required: false,
        // Simplified down to just the one built-in track plus a single
        // "Custom song" choice (was 4 built-in presets + 2 separate custom
        // options) — fewer, clearer choices, matching the picker's design
        // used elsewhere in the product.
        options: [
          { value: "dooron-dooron", label: "Dooron Doron Main", description: "The original default track." },
          { value: "custom", label: "Custom song", description: "Your own link or upload." },
        ],
      },
      {
        id: "musicUrl",
        type: "text",
        label: "Audio URL (if custom)",
        placeholder: "https://...",
        helpText: "Used when \"Custom song\" is selected above — paste a direct link, or upload a file below instead.",
      },
      {
        id: "voiceNote",
        type: "media-upload",
        label: "Upload a Voice Note (optional)",
        helpText: "Used when \"Custom song\" is selected above (if no link is given), or to add a spoken message alongside any track.",
        maxItems: 1,
        mediaAccept: ["audio"],
      },
    ],
    isPricingRelevant: true,
    pricingKey: "addon",
    recipientComponent: "music",
  };
}

export function memoriesSection(opts?: { minItems?: number }): GiftSectionConfig {
  return {
    id: "memories",
    type: "memories",
    title: "Your Favourite Memories",
    description: "Photos, videos, and voice notes that tell your story together.",
    stepLabel: "Memories",
    fields: [
      {
        id: "layout",
        type: "select",
        label: "Layout",
        options: [
          { value: "polaroid", label: "Polaroid" },
          { value: "cinema", label: "Cinema" },
          { value: "scrapbook", label: "Scrapbook" },
        ],
      },
      {
        id: "media",
        type: "memory-list",
        label: "Photos, Videos & Voice Notes",
        helpText: "Add a caption and an image URL or upload for each memory. Photos up to 10MB, audio/voice up to 20MB, videos up to 50MB. Max 12 files.",
        // Was 3 — forcing 3 *uploaded/valid* memories before Continue would
        // even unlock blocked a creator who only wants one or two, and now
        // that every occasion ships 2 default demo photos (lib/demoData.ts)
        // rather than none, requiring 3 would make that default itself
        // insufficient to pass. 1 keeps the section meaningful without
        // being a hard wall.
        minItems: opts?.minItems ?? 1,
        maxItems: 12,
        required: true,
      },
    ],
    recipientComponent: "memories",
  };
}

export function gameSection(): GiftSectionConfig {
  return {
    id: "game",
    type: "game",
    title: "Pick a Little Game",
    description: "A tiny playful challenge before the big moment.",
    stepLabel: "Game",
    fields: [
      {
        id: "gameId",
        type: "select",
        label: "Game",
        required: true,
        options: [
          { value: "sliding-puzzle", label: "Sliding Puzzle" },
          { value: "memory-match", label: "Memory Match" },
        ],
      },
      { id: "puzzleImage", type: "media-upload", label: "Puzzle Image (optional — uses a memory photo by default)", maxItems: 1, mediaAccept: ["image"] },
    ],
    isPricingRelevant: true,
    pricingKey: "game",
    recipientComponent: "game",
  };
}

export function wishesSection(): GiftSectionConfig {
  return {
    id: "wishes",
    type: "wishes",
    title: "Pop-up Wishes",
    description: "Little wishes hidden inside balloons for them to pop.",
    stepLabel: "Wishes",
    fields: [
      { id: "wishes", type: "wish-list", label: "Wishes", maxItems: 7, helpText: "Up to 7 balloons, 15–20 words each." },
    ],
    isPricingRelevant: true,
    pricingKey: "addon",
    recipientComponent: "wishes",
  };
}

export function scratchSection(): GiftSectionConfig {
  return {
    id: "scratch",
    type: "scratch",
    title: "One Last Surprise",
    description: "A foil scratch card revealing one final message.",
    stepLabel: "Surprise",
    fields: [
      { id: "scratchTitle", type: "text", label: "Title", maxLength: 60 },
      { id: "scratchMessage", type: "textarea", label: "Message", maxLength: 200 },
      { id: "scratchImage", type: "media-upload", label: "Image", maxItems: 1, mediaAccept: ["image"] },
    ],
    isPricingRelevant: true,
    pricingKey: "addon",
    recipientComponent: "scratch",
  };
}

export function letterSection(): GiftSectionConfig {
  return {
    id: "letter",
    type: "letter",
    title: "A Handwritten Letter",
    description: "The final, most personal part of the gift.",
    stepLabel: "Letter",
    fields: [
      { id: "greeting", type: "text", label: "Greeting", placeholder: "My dearest...", maxLength: 60 },
      { id: "body", type: "textarea", label: "Body", helpText: "One paragraph per line.", maxLength: 2000, required: true },
      { id: "signOff", type: "text", label: "Sign-off", placeholder: "Forever yours,", maxLength: 60 },
    ],
    recipientComponent: "letter",
  };
}
