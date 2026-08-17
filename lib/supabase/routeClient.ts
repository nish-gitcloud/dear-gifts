import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Auth-aware Supabase client for use inside Server Components / Route
 * Handlers — reads the visitor's session from cookies (set by the browser
 * client during login) so `auth.getUser()` reflects who's actually signed
 * in. Distinct from `lib/supabase/server.ts`'s service-role admin client,
 * which bypasses auth/RLS entirely and should never be used to answer "who
 * is this request from".
 *
 * Returns null when Supabase isn't configured, same convention as every
 * other adapter in this codebase.
 */
export async function getSupabaseRouteClient() {
  if (!env.supabase.isConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient(env.supabase.url!, env.supabase.anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render where cookies can't be
          // mutated — safe to ignore; middleware/route handlers cover writes.
        }
      },
    },
  });
}

/** Convenience helper: the signed-in Supabase auth user, or null (guest / not configured). */
export async function getCurrentAuthUser() {
  const supabase = await getSupabaseRouteClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
