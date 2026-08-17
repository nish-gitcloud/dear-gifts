import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Lightweight, dependency-free admin session (spec section 10). Deliberately
 * NOT tied to Supabase Auth — a store owner needs to reach /admin even on a
 * deployment where customer accounts aren't configured yet. The cookie is a
 * signed, expiring token (HMAC-SHA256 over an expiry timestamp, keyed by
 * ADMIN_PASSWORD) rather than a server-side session store, so it works
 * identically whether or not Supabase is configured.
 */
const ADMIN_COOKIE = "dg_admin_session";
const SESSION_HOURS = 12;

function sign(payload: string): string {
  return createHmac("sha256", env.admin.password ?? "unconfigured").update(payload).digest("hex");
}

export function createAdminSessionToken(): string {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

function isValidToken(token: string | undefined): boolean {
  if (!token || !env.admin.isConfigured) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return false;
  return Number(payload) > Date.now();
}

/** Verifies the submitted password against ADMIN_PASSWORD using a constant-time comparison. */
export function checkAdminPassword(candidate: string): boolean {
  if (!env.admin.isConfigured) return false;
  const expected = Buffer.from(env.admin.password!);
  const actual = Buffer.from(candidate);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Reads and validates the admin session cookie from the current request. */
export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  return isValidToken(store.get(ADMIN_COOKIE)?.value);
}

export { ADMIN_COOKIE, SESSION_HOURS };
