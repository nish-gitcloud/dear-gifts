-- Dear Gifts — Phase 1 core schema
-- Run via `supabase db push` or the Supabase SQL editor.
-- Sensitive values (secret PIN) are NEVER stored in plaintext — only bcrypt hashes.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  phone text,
  auth_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- gifts
-- ---------------------------------------------------------------------------
create table if not exists gifts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references users (id) on delete set null,
  occasion text not null check (
    occasion in (
      'birthday', 'anniversary', 'proposal', 'apology',
      'custom', 'congratulations', 'festival', 'family'
    )
  ),
  recipient_name text not null,
  recipient_phone text,
  -- Never store the raw PIN. secret_pin_hash is a bcrypt hash generated
  -- server-side (see lib/pin.ts). pin_hint is optional creator-provided text.
  secret_pin_hash text not null,
  pin_hint text,
  pin_failed_attempts int not null default 0,
  pin_locked_until timestamptz,
  theme text not null,
  gift_wrap text not null,
  status text not null default 'draft' check (
    status in ('draft', 'pending_payment', 'active', 'expired', 'archived')
  ),
  payment_status text not null default 'not_started' check (
    payment_status in ('not_started', 'pending', 'paid', 'failed', 'refunded')
  ),
  payment_id uuid,
  -- Cryptographically random, unguessable public identifier. Never expose
  -- the primary key `id` in URLs — always use gift_token.
  gift_token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  completed_at timestamptz
);

create index if not exists idx_gifts_creator on gifts (creator_id);
create index if not exists idx_gifts_token on gifts (gift_token);
create index if not exists idx_gifts_status on gifts (status);

-- ---------------------------------------------------------------------------
-- gift_sections — one row per wizard section (config-driven, see config/occasions.ts)
-- ---------------------------------------------------------------------------
create table if not exists gift_sections (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references gifts (id) on delete cascade,
  section_type text not null,
  section_order int not null default 0,
  data_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gift_id, section_type)
);

create index if not exists idx_gift_sections_gift on gift_sections (gift_id);

-- ---------------------------------------------------------------------------
-- media
-- ---------------------------------------------------------------------------
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references gifts (id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video', 'audio')),
  cloudinary_url text not null,
  public_id text not null,
  file_name text,
  file_size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_media_gift on media (gift_id);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references gifts (id) on delete cascade,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount numeric(10, 2) not null,
  currency text not null default 'INR',
  status text not null default 'created' check (
    status in ('created', 'authorized', 'captured', 'failed', 'refunded')
  ),
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_gift on payments (gift_id);

alter table gifts
  add constraint fk_gifts_payment
  foreign key (payment_id) references payments (id) on delete set null;

-- ---------------------------------------------------------------------------
-- gift_views — recipient-side analytics (see spec section 58)
-- ---------------------------------------------------------------------------
create table if not exists gift_views (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references gifts (id) on delete cascade,
  session_id text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_stage text,
  pin_attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_gift_views_gift on gift_views (gift_id);

-- ---------------------------------------------------------------------------
-- gift_edits — audit trail for the limited post-payment editing policy
-- ---------------------------------------------------------------------------
create table if not exists gift_edits (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references gifts (id) on delete cascade,
  edited_by uuid references users (id) on delete set null,
  field text not null,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

create index if not exists idx_gift_edits_gift on gift_edits (gift_id);

-- ---------------------------------------------------------------------------
-- pricing_config — admin-manageable pricing (spec section 9)
-- ---------------------------------------------------------------------------
create table if not exists pricing_config (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- 'base' | 'theme' | 'wrap' | 'game' | 'addon' | 'occasion'
  item_key text not null,
  label text not null,
  price numeric(10, 2) not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (category, item_key)
);

-- ---------------------------------------------------------------------------
-- occasion_config — enable/disable occasions from the admin dashboard
-- ---------------------------------------------------------------------------
create table if not exists occasion_settings (
  occasion text primary key,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- helper: auto-update updated_at
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_gift_sections_updated on gift_sections;
create trigger trg_gift_sections_updated
  before update on gift_sections
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — locked down by default. Application talks to Supabase
-- via the service role key on the server; anon key access is intentionally
-- minimal (recipients never need direct table access, only server API routes).
-- ---------------------------------------------------------------------------
alter table users enable row level security;
alter table gifts enable row level security;
alter table gift_sections enable row level security;
alter table media enable row level security;
alter table payments enable row level security;
alter table gift_views enable row level security;
alter table gift_edits enable row level security;
alter table pricing_config enable row level security;
alter table occasion_settings enable row level security;

-- Public (anon) read access to non-sensitive admin-managed config only.
create policy "public read pricing" on pricing_config for select using (is_active = true);
create policy "public read occasions" on occasion_settings for select using (true);

-- All other access happens through server-side routes using the service role
-- key, which bypasses RLS by design. No anon policies are defined for
-- gifts/gift_sections/media/payments/gift_views/gift_edits/users — this
-- enforces "check gift ownership server-side" (spec section 55) at the
-- database layer, not just in application code.
