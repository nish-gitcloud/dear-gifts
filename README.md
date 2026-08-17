# Dear Gifts — Full Application

An interactive digital gifting platform: creators build a personalized surprise through a
guided wizard; recipients experience it as a cinematic, full-screen story instead of a form or
a static card.

This repository implements the **full stack** described in the project brief: frontend,
backend, database, authentication, storage, payments, admin dashboard, and analytics — not a
static mockup. Every external service (Supabase, Razorpay, Cloudinary) is read through a small
adapter in `lib/env.ts` that reports whether real credentials are configured; when they aren't,
each service falls back to a clearly-labeled mock so the entire create → pay → verify →
recipient pipeline can be exercised locally today, and flips to the real integration with zero
code changes once credentials are added to `.env.local`. Nothing about *how* the app behaves is
faked — the fallback is a swapped data source, not a shortcut in the logic.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · Framer Motion · Zustand · Supabase
(Postgres + Auth) · Razorpay · Cloudinary · `qrcode` · Canvas API (scratch card) · Web Audio API
(candle blow) · `bcryptjs` (PIN hashing) · `cloudinary` npm SDK.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real keys when you have them — see below
npm run dev
```

Open `/` for the marketing homepage, `/create` to build a gift, or `/admin` for the operations
dashboard (needs `ADMIN_PASSWORD` set — see below).

**Note on fonts:** `app/layout.tsx` loads Plus Jakarta Sans, Playfair Display, and Caveat via
`next/font/google`, which fetches font files at build time. Any environment with normal
internet access (your machine, CI, Vercel) builds this as-is with no changes needed.

## What's real vs. mocked

| Service | Real (env configured) | Mock (default, no env) |
|---|---|---|
| Supabase | Reads/writes Postgres via `lib/supabase/server.ts` (service role) + Supabase Auth for accounts | In-memory store, `lib/mockStore.ts` / `lib/analyticsRepo.ts` / `lib/pricingRepo.ts` (resets on server restart) |
| Razorpay | Creates real orders, verifies real HMAC signatures | Mock order id + a deterministic mock signature, `services/razorpay.ts` |
| Cloudinary | Uploads via the `cloudinary` SDK, returns real CDN URLs | Deterministic (non-fetchable) mock URL, `services/cloudinary.ts` — the creator UI shows a clear "preview needs live storage" state rather than a broken image |

**Fully real regardless of mock mode** (no external dependency, pure logic): PIN hashing
(bcrypt) + brute-force lockout, gift/management token generation, dynamic pricing calculation,
the payment verification gate (a gift is *only* activated after a signature check passes —
never on frontend "success" alone), the admin shared-secret session (HMAC-signed, independent
of Supabase), and post-payment edit whitelisting.

To go live: run every file in `supabase/migrations/` in order against a Supabase project, fill
in `.env.local` (Supabase, Razorpay, Cloudinary, `ADMIN_PASSWORD`), and every route switches to
the real path automatically.

### Admin dashboard access

Set `ADMIN_PASSWORD` in `.env.local` (already set to `dev-admin-password` for local testing) and
visit `/admin`. This is a shared-secret login independent of Supabase Auth, by design — an
operator needs to reach it even on a deployment with no customer accounts configured yet.

## Architecture — where the "configuration-driven" principle lives

- **`config/occasions.ts`** — the single source of truth. Each of the 8 occasions is a list of
  `GiftSectionConfig` objects (built from reusable builders in `config/sections.ts`) plus a
  `recipientFlow` array (the playback order of stages the recipient sees). Adding occasion #9
  means adding one entry here.
- **`config/themes.ts`** — 16 themes as `ThemeTokens` objects. `components/ThemeScope.tsx`
  applies one via CSS custom properties + `data-theme`.
- **`config/pricing.ts`** — the *default* pricing table and calculation logic, admin-overridable
  at runtime via `lib/pricingRepo.ts` (backed by the `pricing_config` table / an in-memory
  override map). `lib/wizardPricingServer.ts`'s `calculateWizardPriceAsync` is the one function
  allowed to compute what a creator is actually charged — it always reads the live, admin-managed
  table, never the static defaults directly.
- **`lib/occasionSettings.ts`** — admin enable/disable per occasion (`occasion_settings` table /
  in-memory override), enforced both in the UI (`/create`, `/occasions`) and server-side in
  `POST /api/gifts` (a disabled occasion can't be created via a direct API call either).
- **`components/creator/fields/*`** — one component per `FieldType`. `FieldRenderer.tsx` is the
  only place that switches on field type.
- **`components/creator/CreatorWizard.tsx`** — reads an `OccasionDefinition`, renders one section
  per screen, autosaves to `localStorage` via `hooks/useWizardStore.ts`, shows a resume banner on
  return visits, and fires creator-funnel analytics per step.
- **`components/recipient/RecipientExperience.tsx`** — walks an occasion's `recipientFlow` and
  renders one full-screen stage at a time. Every occasion has bespoke stage components now (not
  a generic fallback) — Birthday, Anniversary (toast, timeline, then-vs-now, promise), Proposal
  (jar of reasons, build-up, ring box press-and-hold, finale), Apology (gift reveal, broken-heart
  repair, let-it-go lantern, pledge), Custom Wishes (dynamic celebration sub-sequence composed
  from whichever elements the creator picked), and Congratulations/Festival's trophy/generic
  reveal.

## The full pipeline, wired end-to-end

```
/create               → occasion selector (only shows admin-enabled occasions)
/create/[occasion]    → wizard (config-driven, autosaves, resumable, tracks funnel step)
/create/[occasion]/preview  → same recipient engine, demo-data fallback, "Preview Mode" banner
/create/[occasion]/summary  → itemized dynamic pricing, "Pay & Create"
  → POST /api/gifts                (creates gift, pending_payment, PIN hashed, price computed server-side from live pricing table)
  → POST /api/payments/create-order (Razorpay order, mock or real)
  → POST /api/payments/verify       (signature check → ONLY THEN activates the gift; records the payment either way, captured or failed)
/create/[occasion]/success  → gift link + QR, and — for guests — a private management link with a "Create Free Account" offer
/gift/[token]          → recipient experience; PIN checked server-side with 5-attempt lockout; view/PIN/stage/completion analytics recorded throughout
/manage/[token]         → guest gift management: status, expiry, link/QR, whitelisted field edits, "Create New Gift From This" (duplicate → fresh payment)
/dashboard              → signed-in creators' full gift list (guests are pointed at their management link instead, with a "paste your link" jump box)
/admin                  → shared-secret-gated: overview stats, orders, all gifts, customers, analytics funnels, live pricing editor, occasion toggles
```

Verified end-to-end (via direct API calls and real Playwright browser sessions, not just code
review): gift creation → payment → activation → recipient PIN unlock → stage progression;
guest management-link edit + duplicate + re-payment; admin login → every dashboard tab →
pricing change immediately affecting a newly-created gift's price → occasion disable
immediately blocking both the picker and direct API creation; a real file upload through
`/api/uploads` with the wizard correctly blocking "Continue" until it finishes.

## Analytics (spec section 58)

`lib/analyticsClient.ts` (`trackEvent`) fires creator-funnel events (occasion selected → wizard
step reached → preview reached → checkout started → payment completed) to
`POST /api/analytics/event`, stored in `analytics_events` (or the in-memory equivalent). The
recipient funnel reuses the existing `gift_views` table — previously defined in the schema but
never written to; now populated on every gift page load, PIN attempt, stage transition, and
"watch again," with a group-by on `last_stage` powering the admin drop-off view. See
`/admin/analytics`.

## What's still simplified — read before a real launch

- **Mock-mode persistence is in-memory only.** Every mock store (gifts, payments, analytics
  events, pricing overrides, occasion toggles) lives in a `globalThis` map and is wiped on
  server restart. This is fine for local development; a real deployment needs Supabase
  configured for any of this to persist.
- **Customer records in mock mode are approximate.** Without Supabase Auth, there's no `users`
  table to key by, so the admin Customers view rolls every guest checkout into a single "Guest
  checkouts" aggregate row rather than listing individuals.
- **PIN-attempt attribution uses a "most recent view session" heuristic** (`lib/analyticsRepo.ts`'s
  `recordPinAttempt`) rather than a request-scoped session id, since the PIN-check route doesn't
  otherwise know which specific page-load is attempting it. Correct for the overwhelmingly common
  case (one active viewing session at a time) but not airtight under concurrent tabs.
- **Legal pages (`/privacy-policy`, `/terms`, `/refund-policy`) are solid first drafts**, written
  to accurately describe what this app actually does (Supabase/Razorpay/Cloudinary usage, PIN
  hashing, 30-day expiry) — but they are not a substitute for review by an actual lawyer before
  a real commercial launch.
- **The contact form stores messages** (`contact_messages` table / in-memory log) but doesn't yet
  send an email or Slack notification anywhere — an operator has to query the table/admin data
  directly. Wiring a notification is a small addition (e.g. a transactional email provider) once
  one is chosen.
- **No rate limiting** on public API routes (PIN verification, contact form, gift creation)
  beyond the existing 5-attempt PIN lockout. Worth adding at the edge (e.g. Vercel's built-in
  protections, or a small IP-based limiter) before a real launch.

## Project structure

```
app/            routes — (marketing) route group (home, how-it-works, occasions, pricing, faq,
                contact, legal), /create wizard, /gift/[token], /manage/[token], /dashboard,
                /admin (dashboard route group + /admin/login), /duplicate, /auth, API routes
components/     ui/, creator/ (wizard, fields, auth form), recipient/ (every occasion's stage
                components + the playback engine), marketing/ (site header/footer), ThemeScope
config/         occasions.ts, sections.ts, themes.ts, pricing.ts, wraps.ts — the "data" layer
lib/            token/pin/media/age/theme/editPolicy helpers, Supabase clients (admin + auth-
                aware route client), mockStore.ts, giftRepo.ts, adminRepo.ts, analyticsRepo.ts,
                analyticsClient.ts, pricingRepo.ts, occasionSettings.ts, contactRepo.ts,
                creator.ts (resolves a Supabase user to a `users` row), adminAuth.ts
services/       cloudinary.ts, razorpay.ts — external integrations behind mock fallbacks
hooks/          useWizardStore.ts, useAuth.ts, useHoldProgress.ts
types/          gift.ts — shared domain types
supabase/migrations/  SQL schema, pricing seed data, manage-token/edits, gift amount + admin
                columns, analytics_events, contact_messages — run in numeric order
```
