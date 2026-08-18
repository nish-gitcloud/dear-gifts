/**
 * Centralized environment access. Every external service (Supabase,
 * Razorpay, Cloudinary) is read through here so there is exactly one place
 * that knows about env var names, and exactly one place to swap placeholders
 * for real credentials later (see .env.example).
 *
 * `isConfigured` flags let services gracefully fall back to mock behavior in
 * this Phase 1 scaffold instead of throwing at import time.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  supabase: {
    url: read("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: read("SUPABASE_SERVICE_ROLE_KEY"),
    get isConfigured() {
      return Boolean(this.url && this.anonKey);
    },
  },
  razorpay: {
    keyId: read("RAZORPAY_KEY_ID"),
    keySecret: read("RAZORPAY_KEY_SECRET"),
    get isConfigured() {
      return Boolean(this.keyId && this.keySecret);
    },
  },
  cashfree: {
    appId: read("CASHFREE_APP_ID"),
    secretKey: read("CASHFREE_SECRET_KEY"),
    // "sandbox" (Cashfree's test environment — no real money moves) or
    // "production" (real charges). Defaults to sandbox so an app/secret
    // pasted in without also setting this can't accidentally go live.
    mode: (read("CASHFREE_MODE") ?? "sandbox") as "sandbox" | "production",
    get isConfigured() {
      return Boolean(this.appId && this.secretKey);
    },
  },
  cloudinary: {
    cloudName: read("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    apiKey: read("CLOUDINARY_API_KEY"),
    apiSecret: read("CLOUDINARY_API_SECRET"),
    uploadPreset: read("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"),
    get isConfigured() {
      return Boolean(this.cloudName && this.apiKey && this.apiSecret);
    },
  },
  app: {
    url: read("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
    giftExpiryDays: Number(read("GIFT_EXPIRY_DAYS") ?? "30"),
  },
  admin: {
    // Shared-secret gate for /admin (spec section 10). This is intentionally
    // separate from Supabase Auth — the admin dashboard should work even on
    // a deployment that has no customer accounts configured yet.
    password: read("ADMIN_PASSWORD"),
    get isConfigured() {
      return Boolean(this.password);
    },
  },
};
