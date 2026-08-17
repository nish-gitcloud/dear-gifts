import { NextRequest, NextResponse } from "next/server";
import { getGiftByManageToken } from "@/lib/giftRepo";

/**
 * Guest gift-management lookup (spec section 6). The management token is a
 * long, unguessable secret handed out once at gift creation — knowing it is
 * the only "authentication" a guest creator has, so this route intentionally
 * never leaks the secret PIN hash or accepts the public gift token instead.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const gift = await getGiftByManageToken(token);
  if (!gift) {
    return NextResponse.json({ error: "We couldn't find a gift for this management link." }, { status: 404 });
  }
  return NextResponse.json({ gift });
}
