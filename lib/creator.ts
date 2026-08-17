import "server-only";
import { getCurrentAuthUser } from "@/lib/supabase/routeClient";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Resolves the `users.id` row to attach as a gift's `creator_id`, creating
 * that row on first use if a Supabase-authenticated visitor doesn't have
 * one yet. Returns null for guests or when Supabase isn't configured —
 * callers should treat that as "guest creation" (spec section 5) and rely
 * on the gift's `manage_token` instead of an account.
 */
export async function resolveCreatorId(): Promise<string | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const authUser = await getCurrentAuthUser();
  if (!authUser) return null;

  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await admin
    .from("users")
    .insert({ auth_user_id: authUser.id, email: authUser.email })
    .select("id")
    .single();
  if (error) return null;
  return created.id;
}
