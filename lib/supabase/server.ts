import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Server-only Supabase client using the service role key. This is the ONLY
 * place gift ownership/expiry/payment checks should be trusted from (spec
 * section 55: "check gift ownership server-side", "check expiry
 * server-side"). Never import this from a client component.
 *
 * Returns null when unconfigured so API routes can respond with a clear
 * "backend not connected yet" error in this Phase 1 scaffold rather than
 * crashing the process at import time.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!env.supabase.isConfigured || !env.supabase.serviceRoleKey) return null;
  if (cached) return cached;
  cached = createClient(env.supabase.url!, env.supabase.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
