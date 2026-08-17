import { NextRequest, NextResponse } from "next/server";
import { applyGiftEditsByManageToken } from "@/lib/giftRepo";
import type { EditRequest } from "@/lib/editPolicy";

/**
 * Applies limited post-payment corrections (spec section 6) — recipient
 * name/PIN hint, letter and wish text, memory captions, and similar minor
 * fixes. Theme, wrap, occasion, and the paid interactive elements are NOT
 * editable here by design; those require "Create New Gift" (see
 * lib/editPolicy.ts for the exact whitelist and /duplicate for the re-buy flow).
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { edits } = (await request.json()) as { edits: EditRequest[] };

  if (!Array.isArray(edits) || edits.length === 0) {
    return NextResponse.json({ error: "No edits provided." }, { status: 422 });
  }

  const result = await applyGiftEditsByManageToken(token, edits);
  if (!result) {
    return NextResponse.json({ error: "We couldn't find a gift for this management link." }, { status: 404 });
  }
  return NextResponse.json(result);
}
