"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { signIn, signUp, isConfigured } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = mode === "login" ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === "signup") {
      setCheckEmail(true);
    } else {
      router.push(redirectTo);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFAF7] px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-[#241A17]">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-black/55">
          {mode === "login" ? "Sign in to see and manage your gifts." : "So you never lose a surprise you've made."}
        </p>

        {!isConfigured && (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Accounts aren&apos;t configured on this deployment yet — you can still create and manage gifts as a
            guest via the secure link on your success page.
          </p>
        )}

        {checkEmail ? (
          <p className="mt-6 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
            Check your email to confirm your account, then sign in.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#241A17]">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#241A17]">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#E85C7B] focus:ring-2 focus:ring-[#E85C7B]/20"
              />
            </label>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" disabled={loading || !isConfigured} className="w-full">
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-black/45">
          {mode === "login" ? (
            <>
              New here? <Link href="/auth/signup" className="text-[#E85C7B] underline">Create an account</Link>
            </>
          ) : (
            <>
              Already have one? <Link href="/auth/login" className="text-[#E85C7B] underline">Sign in</Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
