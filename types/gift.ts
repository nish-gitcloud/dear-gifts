// Core domain types shared across the creator wizard, recipient experience,
// config-driven occasion system, and Supabase data layer.

export type OccasionId =
  | "birthday"
  | "anniversary"
  | "proposal"
  | "apology"
  | "custom"
  | "congratulations"
  | "festival"
  | "family";

export type GiftStatus = "draft" | "pending_payment" | "active" | "expired" | "archived";
export type PaymentStatus = "not_started" | "pending" | "paid" | "failed" | "refunded";

/**
 * Every field a creator can fill in within a section. Kept generic so the
 * wizard can render arbitrary section shapes without per-occasion UI code.
 */
export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "pin"
  | "phone"
  | "select"
  | "theme-picker"
  | "wrap-picker"
  | "cake-picker"
  | "mood-picker"
  | "media-upload"
  | "memory-list"
  | "list"
  | "milestone-list"
  | "wish-list"
  | "toggle-group";

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  price?: number; // in paise/rupees per pricing config; resolved at runtime
  image?: string;
}

export interface SectionField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  options?: FieldOption[];
  validation?: {
    pattern?: string;
    message?: string;
  };
  /**
   * Restricts a `media-upload` field's file picker + validation to specific
   * kinds — e.g. an image-only puzzle/ring/scratch photo shouldn't offer an
   * audio-file picker, and a voice-note field shouldn't offer photo/video.
   * Omitted (only true for the generic upload cases) means all kinds stay
   * allowed.
   */
  mediaAccept?: Array<"image" | "video" | "audio">;
}

/**
 * A single step/screen in the creator wizard AND the matching stage in the
 * recipient experience. This is the atomic building block the whole
 * "configuration-driven architecture" (spec section 69) is built from.
 */
export interface GiftSectionConfig {
  id: string; // stable id, also used as gift_sections.section_type
  type: string; // semantic block type: recipient | theme | wrap | cake | ...
  title: string; // creator-facing step title, e.g. "Who is this for?"
  description?: string; // emotional prompt shown above the fields
  stepLabel: string; // short label for the progress bar, e.g. "Recipient"
  fields: SectionField[];
  isPricingRelevant?: boolean;
  pricingKey?: string; // key into config/pricing.ts for this section's price
  recipientComponent: string; // key resolved to a React component for playback
  optional?: boolean;
}

export interface OccasionDefinition {
  id: OccasionId;
  title: string;
  tagline: string;
  description: string;
  icon: string; // icon name/emoji fallback
  accentTheme: string; // default theme id
  sections: GiftSectionConfig[];
  recipientFlow: string[]; // ordered list of recipientComponent keys incl. fixed stages
  enabled: boolean;
}

export interface ThemeTokens {
  id: string;
  name: string;
  emoji: string; // representative icon shown on the theme-picker card
  moodDescription: string; // one-line mood/vibe description shown on the theme-picker card
  group: "classic" | "romantic" | "festive" | "elegant";
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  accent: string;
  particleStyle: "none" | "stars" | "hearts" | "confetti" | "snow" | "sparkle" | "petals";
  buttonStyle: "rounded" | "pill" | "sharp";
  cardStyle: "glass" | "solid" | "paper";
  fontDisplay: string;
  fontBody: string;
  animationStyle: "soft" | "energetic" | "dreamy" | "cinematic";
  previewGradient: string; // used for the theme picker swatch
}

export interface GiftWrapOption {
  id: string;
  category: "box" | "envelope" | "scroll" | "chest";
  name: string;
  previewImage: string;
  price: number;
}

export interface MediaItem {
  id: string;
  giftId: string;
  mediaType: "image" | "video" | "audio";
  cloudinaryUrl: string;
  publicId: string;
  fileName: string;
  createdAt: string;
}

export interface GiftRecord {
  id: string;
  creatorId: string | null;
  occasion: OccasionId;
  recipientName: string;
  recipientPhone: string | null;
  pinHint: string | null;
  theme: string;
  giftWrap: string;
  status: GiftStatus;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  giftToken: string;
  amount: number;
  createdAt: string;
  expiresAt: string | null;
  completedAt: string | null;
}

export interface GiftSectionData {
  id: string;
  giftId: string;
  sectionType: string;
  sectionOrder: number;
  dataJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WizardState {
  occasion: OccasionId | null;
  currentStepIndex: number;
  values: Record<string, Record<string, unknown>>; // sectionId -> field values
  totalPrice: number;
  lastSavedAt: string | null;
}

export interface PriceBreakdownLine {
  label: string;
  amount: number;
}

export interface PriceBreakdown {
  lines: PriceBreakdownLine[];
  total: number;
}
