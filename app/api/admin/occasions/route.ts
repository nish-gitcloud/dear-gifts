import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { listOccasionToggles, setOccasionEnabled } from "@/lib/occasionSettings";
import type { OccasionId } from "@/types/gift";

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ occasions: await listOccasionToggles() });
}

/** Enables/disables an occasion storefront-wide (spec section 10). */
export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { occasionId, enabled } = (await request.json()) as { occasionId: OccasionId; enabled: boolean };
  if (!occasionId || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid occasion update." }, { status: 422 });
  }
  await setOccasionEnabled(occasionId, enabled);
  return NextResponse.json({ ok: true });
}
