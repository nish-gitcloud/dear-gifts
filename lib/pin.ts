import bcrypt from "bcryptjs";

/**
 * PIN hashing + brute-force protection helpers (spec sections 5, 55, 56).
 * The raw 4-digit PIN is NEVER persisted or logged — only its bcrypt hash.
 */

const SALT_ROUNDS = 10;
export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCKOUT_MINUTES = 10;

export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error("PIN must be exactly 4 digits.");
  }
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) return false;
  return bcrypt.compare(pin, hash);
}

export interface PinAttemptState {
  failedAttempts: number;
  lockedUntil: string | null;
}

/**
 * Pure function deciding whether a PIN check should even be attempted, and
 * what the new attempt state should be after a check. Server routes call
 * this so the lockout logic lives in one place and is easy to unit test.
 */
export function isLockedOut(state: PinAttemptState, now: Date = new Date()): boolean {
  if (!state.lockedUntil) return false;
  return new Date(state.lockedUntil).getTime() > now.getTime();
}

export function nextAttemptState(
  state: PinAttemptState,
  wasCorrect: boolean,
  now: Date = new Date()
): PinAttemptState {
  if (wasCorrect) {
    return { failedAttempts: 0, lockedUntil: null };
  }
  const failedAttempts = state.failedAttempts + 1;
  if (failedAttempts >= MAX_PIN_ATTEMPTS) {
    const lockedUntil = new Date(now.getTime() + PIN_LOCKOUT_MINUTES * 60_000).toISOString();
    return { failedAttempts, lockedUntil };
  }
  return { failedAttempts, lockedUntil: null };
}
