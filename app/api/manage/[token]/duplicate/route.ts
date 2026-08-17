import { NextRequest, NextResponse } from "next/server";
import { duplicateGiftByManageToken } from "@/lib/giftRepo";

/**
 * "Create New Gift from this one" (spec section 6) — clones all content into
 * a fresh `pending_payment` draft. Nothing is delivered to a recipient until
 * the new draft goes through the normal create → pay → verify pipeline
 * again, so duplicating never gives away a second gift for free.
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const duplicated = await duplicateGiftByManageToken(token);
  if (!duplicated) {
    return NextResponse.json({ error: "We couldn't find a gift for this management link." }, { status: 404 });
  }
  return NextResponse.json(duplicated);
}
