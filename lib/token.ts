import { randomBytes } from "crypto";

/**
 * Generates a cryptographically random, URL-safe gift token, e.g. "8fK92LmQxP".
 * This is what ends up in the public /gift/[token] URL — the database primary
 * key (`gifts.id`) must NEVER be exposed to clients (spec sections 5 & 74).
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // unambiguous chars only

export function generateGiftToken(length = 10): string {
  const bytes = randomBytes(length);
  let token = "";
  for (let i = 0; i < length; i++) {
    token += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return token;
}

/** Session id for anonymous recipient analytics (gift_views.session_id). */
export function generateSessionId(): string {
  return randomBytes(16).toString("hex");
}

/**
 * A second, longer token given only to the guest creator (never shown to
 * the recipient) so they can manage their gift without an account (spec
 * section 6: "give them a secure management link"). Longer than the public
 * gift token since it grants edit rights, not just view rights.
 */
export function generateManageToken(): string {
  return generateGiftToken(20);
}
