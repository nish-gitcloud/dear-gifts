import { NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/lib/supabase/routeClient";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { listGiftsForCreator } from "@/lib/giftRepo";

/**
 * "My Gifts" dashboard listing (spec section 6) — only ever returns gifts
 * belonging to the currently signed-in creator. Guests have no account row
 * to look up against, so they see an empty/unauthenticated response here
 * and rely on their per-gift `/manage/[token]` link instead.
 */
export async function GET() {
  const authUser = await getCurrentAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Sign in to see your gifts.", gifts: [] }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ gifts: [] });
  }

  const { data: userRow } = await admin.from("users").select("id").eq("auth_user_id", authUser.id).maybeSingle();
  if (!userRow) {
    return NextResponse.json({ gifts: [] });
  }

  const gifts = await listGiftsForCreator(userRow.id);
  return NextResponse.json({ gifts });
}
