import type { OccasionDefinition } from "@/types/gift";
import { calculatePrice } from "@/config/pricing";

/**
 * Reads the wizard's current field values and derives the pricing selection
 * object `calculatePrice()` expects. Kept as a small mapping table (rather
 * than baking pricing logic into each section component) so pricing stays
 * centralized and any occasion can plug in without extra code (spec
 * section 9: "pricing must be dynamic... do not hardcode into UI").
 */
export function priceSelectionsFromWizard(
  occasion: OccasionDefinition,
  values: Record<string, Record<string, unknown>>
) {
  const addons: string[] = [];

  const theme = values["theme"]?.themeId as string | undefined;
  const wrap = values["gift-wrap"]?.wrapId as string | undefined;
  const game = values["game"]?.gameId as string | undefined;

  const cakeId = values["cake"]?.cakeId as string | undefined;
  if (cakeId) addons.push(cakeId);

  const scratch = values["scratch"];
  if (scratch && ((scratch.scratchTitle as string) || (scratch.scratchMessage as string))) {
    addons.push("scratch-card");
  }

  const wishes = (values["wishes"]?.wishes as string[]) ?? [];
  if (wishes.some((w) => w?.trim())) addons.push("pop-wishes");

  // "Custom song" merges the old separate "paste a link" / "upload a file"
  // choices into one option — only the upload path is the paid add-on, so
  // it only applies once there's no link (a link means they didn't use the
  // uploaded-file path even if they also added one).
  const musicSource = values["mood"]?.musicSource as string | undefined;
  const musicUrl = values["mood"]?.musicUrl as string | undefined;
  const voiceNote = values["mood"]?.voiceNote as Array<{ status: string; previewUrl: string }> | undefined;
  const hasUploadedSong = voiceNote?.some((v) => v.status === "done" && v.previewUrl);
  if (musicSource === "custom" && !musicUrl?.trim() && hasUploadedSong) addons.push("custom-song-upload");

  return { theme, wrap, game, addons };
}

export function calculateWizardPrice(
  occasion: OccasionDefinition,
  values: Record<string, Record<string, unknown>>
) {
  return calculatePrice(priceSelectionsFromWizard(occasion, values));
}
