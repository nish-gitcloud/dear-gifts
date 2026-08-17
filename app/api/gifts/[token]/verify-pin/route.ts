import { NextRequest, NextResponse } from "next/server";
import { getGiftByToken, verifyGiftPin } from "@/lib/giftRepo";
import { recordPinAttempt } from "@/lib/analyticsRepo";

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { pin } = (await request.json()) as { pin: string };

  const gift = await getGiftByToken(token);
  if (!gift) {
    return NextResponse.json({ valid: false, message: "This surprise couldn't be found." }, { status: 404 });
  }
  if (gift.status === "expired" || (gift.expiresAt && new Date(gift.expiresAt) < new Date())) {
    return NextResponse.json({ valid: false, message: "This little surprise has completed its journey." }, { status: 410 });
  }

  const result = await verifyGiftPin(gift.id, pin);
  // Best-effort — attributed to this gift's most recent view session (spec
  // section 58's per-recipient-session PIN attempt count). Never blocks the
  // actual PIN response on analytics succeeding.
  await recordPinAttempt(gift.id).catch(() => {});
  return NextResponse.json(result);
}
