import type { GiftWrapOption } from "@/types/gift";
import { priceFor } from "./pricing";

/**
 * Gift wrap catalogue (spec section 16). Grouped into four visual families —
 * box, envelope, scroll, chest — each rendered with its own 3D-style preview
 * component (see components/creator/GiftWrapPreview.tsx) and its own opening
 * animation in the recipient experience (components/recipient/GiftUnlock.tsx).
 */
export const GIFT_WRAPS: GiftWrapOption[] = [
  { id: "box-classic-pink", category: "box", name: "Classic Pink", previewImage: "/images/wraps/box-classic-pink.svg", price: priceFor("wrap", "box-classic-pink") },
  { id: "box-royal-gold", category: "box", name: "Royal Gold", previewImage: "/images/wraps/box-royal-gold.svg", price: priceFor("wrap", "box-royal-gold") },
  { id: "box-mint-silver", category: "box", name: "Mint & Silver", previewImage: "/images/wraps/box-mint-silver.svg", price: priceFor("wrap", "box-mint-silver") },
  { id: "box-rainbow-pop", category: "box", name: "Rainbow Pop", previewImage: "/images/wraps/box-rainbow-pop.svg", price: priceFor("wrap", "box-rainbow-pop") },

  { id: "envelope-classic-cream", category: "envelope", name: "Classic Cream", previewImage: "/images/wraps/envelope-classic-cream.svg", price: priceFor("wrap", "envelope-classic-cream") },
  { id: "envelope-rose-gold", category: "envelope", name: "Rose Gold", previewImage: "/images/wraps/envelope-rose-gold.svg", price: priceFor("wrap", "envelope-rose-gold") },
  { id: "envelope-midnight-navy", category: "envelope", name: "Midnight Navy", previewImage: "/images/wraps/envelope-midnight-navy.svg", price: priceFor("wrap", "envelope-midnight-navy") },

  { id: "scroll-classic-parchment", category: "scroll", name: "Classic Parchment", previewImage: "/images/wraps/scroll-classic-parchment.svg", price: priceFor("wrap", "scroll-classic-parchment") },
  { id: "scroll-royal-navy", category: "scroll", name: "Royal Navy", previewImage: "/images/wraps/scroll-royal-navy.svg", price: priceFor("wrap", "scroll-royal-navy") },
  { id: "scroll-rose-blush", category: "scroll", name: "Rose Blush", previewImage: "/images/wraps/scroll-rose-blush.svg", price: priceFor("wrap", "scroll-rose-blush") },

  { id: "chest-classic-oak", category: "chest", name: "Classic Oak", previewImage: "/images/wraps/chest-classic-oak.svg", price: priceFor("wrap", "chest-classic-oak") },
  { id: "chest-dark-ebony", category: "chest", name: "Dark Ebony", previewImage: "/images/wraps/chest-dark-ebony.svg", price: priceFor("wrap", "chest-dark-ebony") },
  { id: "chest-royal-mahogany", category: "chest", name: "Royal Mahogany", previewImage: "/images/wraps/chest-royal-mahogany.svg", price: priceFor("wrap", "chest-royal-mahogany") },
];

export function getWrap(id: string): GiftWrapOption {
  return GIFT_WRAPS.find((w) => w.id === id) ?? GIFT_WRAPS[0];
}
