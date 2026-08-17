-- Creator-funnel analytics (spec section 58): occasion selection, wizard
-- step progress, preview, checkout start, and payment completion. Recipient-
-- funnel analytics reuses the existing `gift_views` table (session_id,
-- pin_attempts, last_stage, completed_at) which, until now, nothing actually
-- wrote to — see app/gift/[token]/page.tsx and
-- app/api/gifts/[token]/verify-pin/route.ts for where that gap is closed.
--
-- Deliberately a single generic event table rather than one column per
-- funnel step: new steps/events can be added without another migration, and
-- funnel drop-off is just a group-by on `event_type` (see lib/analyticsRepo.ts).

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_type text not null,
  occasion text,
  gift_id uuid references gifts (id) on delete set null,
  step text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_type on analytics_events (event_type);
create index if not exists idx_analytics_events_occasion on analytics_events (occasion);
create index if not exists idx_analytics_events_session on analytics_events (session_id);

alter table analytics_events enable row level security;
-- No anon policies — every write goes through POST /api/analytics/event using
-- the service-role client, same "check server-side" convention as the rest
-- of this schema (see supabase/migrations/0001_init.sql's closing comment).
