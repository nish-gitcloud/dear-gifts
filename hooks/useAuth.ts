"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthResult {
  error?: string;
}

/**
 * Client-side auth state + actions, backed by Supabase Auth. When Supabase
 * isn't configured (this scaffold's default placeholder mode), `isConfigured`
 * is false and every action returns a clear error instead of crashing —
 * the rest of the app treats every visitor as a guest in that case.
 */
export function useAuth() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    // When Supabase isn't configured, `loading` was already initialized to
    // `false` above (via `useState(Boolean(supabase))`) — nothing to
    // synchronize here, so this effect simply does nothing in that case.
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { error: "Accounts aren't set up on this deployment yet." };
      const { error } = await supabase.auth.signUp({ email, password });
      return error ? { error: error.message } : {};
    },
    [supabase]
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { error: "Accounts aren't set up on this deployment yet." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { error: error.message } : {};
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  return { user, loading, isConfigured: Boolean(supabase), signUp, signIn, signOut };
}
