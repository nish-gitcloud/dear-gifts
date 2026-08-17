-- Contact form submissions (spec section 18's Contact page). No anon
-- policies — written only via POST /api/contact using the service-role
-- client, same convention as every other write path in this schema.

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;
