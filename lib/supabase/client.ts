"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Browser Supabase client. Returns null when Supabase isn't configured yet
 * (Phase 1 placeholder mode) so client components can fall back to
 * localStorage-based autosave instead of crashing. Once real credentials are
 * added to .env.local this starts working with zero code changes.
 */
export function createSupabaseBrowserClient() {
  if (!env.supabase.isConfigured) return null;
  return createBrowserClient(env.supabase.url!, env.supabase.anonKey!);
}
