import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { activateGiftManually } from "@/lib/adminRepo";

/**
 * Manually activates a gift stuck in `pending_payment` (see
 * lib/adminRepo.ts's activateGiftManually and the top comment on
 * app/create/[occasion]/pay-manual for why this exists — a temporary
 * stand-in for the automatic Cashfree verify step while payment collection
 * goes through a single static Payment Link/Page instead of a per-gift one).
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const result = await activateGiftManually(id);
  if (!result) return NextResponse.json({ error: "Gift not found or already activated." }, { status: 404 });
  return NextResponse.json(result);
}
