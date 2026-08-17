import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getOccasion } from "@/config/occasions";
import { calculateWizardPriceAsync } from "@/lib/wizardPricingServer";
import { hashPin } from "@/lib/pin";
import { generateGiftToken, generateManageToken } from "@/lib/token";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createMockGift } from "@/lib/mockStore";
import { resolveCreatorId } from "@/lib/creator";
import { isOccasionEnabledEffective } from "@/lib/occasionSettings";

/**
 * Creates a gift in `pending_payment` status. The gift is NOT activated
 * here — activation only happens after `/api/payments/verify` confirms a
 * real (or, in Phase 1 mock mode, simulated) payment (spec section 8).
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { occasion: occasionId, values } = body as {
    occasion: string;
    values: Record<string, Record<string, unknown>>;
  };

  const occasion = getOccasion(occasionId);
  if (!occasion) {
    return NextResponse.json({ error: "Unknown occasion." }, { status: 400 });
  }
  if (!(await isOccasionEnabledEffective(occasion.id))) {
    return NextResponse.json({ error: "This occasion isn't available right now." }, { status: 403 });
  }

  const recipient = values?.recipient ?? {};
  const recipientName = String(recipient.recipientName ?? "").trim();
  const secretPin = String(recipient.secretPin ?? "");

  if (!recipientName) {
    return NextResponse.json({ error: "Recipient name is required." }, { status: 422 });
  }
  if (!/^\d{4}$/.test(secretPin)) {
    return NextResponse.json({ error: "A 4-digit secret PIN is required." }, { status: 422 });
  }

  const theme = String(values?.theme?.themeId ?? occasion.accentTheme);
  const giftWrap = String(values?.["gift-wrap"]?.wrapId ?? "");
  const pinHint = recipient.pinHint ? String(recipient.pinHint) : null;

  const price = await calculateWizardPriceAsync(occasion, values);
  const pinHash = await hashPin(secretPin);
  const giftId = randomUUID();
  const giftToken = generateGiftToken();
  const manageToken = generateManageToken();
  const creatorId = await resolveCreatorId();

  // Strip the raw PIN out of section data before persisting anywhere.
  const sanitizedSections = { ...values, recipient: { ...recipient, secretPin: undefined } };

  const admin = getSupabaseAdmin();
  if (admin) {
    const { error } = await admin.from("gifts").insert({
      id: giftId,
      creator_id: creatorId,
      occasion: occasion.id,
      recipient_name: recipientName,
      secret_pin_hash: pinHash,
      pin_hint: pinHint,
      theme,
      gift_wrap: giftWrap,
      status: "pending_payment",
      payment_status: "pending",
      gift_token: giftToken,
      manage_token: manageToken,
      amount: price.total,
    });
    if (error) {
      return NextResponse.json({ error: "Failed to create gift." }, { status: 500 });
    }
    await admin.from("gift_sections").insert(
      Object.entries(sanitizedSections).map(([sectionType, data], order) => ({
        gift_id: giftId,
        section_type: sectionType,
        section_order: order,
        data_json: data,
      }))
    );
  } else {
    createMockGift({
      id: giftId,
      creatorId,
      occasion: occasion.id,
      recipientName,
      pinHint,
      secretPinHash: pinHash,
      theme,
      giftWrap,
      giftToken,
      manageToken,
      amount: price.total,
      sections: sanitizedSections,
    });
  }

  return NextResponse.json({
    giftId,
    giftToken,
    manageToken: creatorId ? undefined : manageToken, // only surface it for guests — account holders manage via /dashboard
    amount: price.total,
    breakdown: price.lines,
  });
}
