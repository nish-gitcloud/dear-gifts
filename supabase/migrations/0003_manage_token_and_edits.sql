-- Adds guest-management support (spec section 6: "give them a secure
-- management link") and makes gift_edits enforceable from the edit API.

alter table gifts add column if not exists manage_token text unique;
create index if not exists idx_gifts_manage_token on gifts (manage_token);

-- Fields a creator may edit after payment without triggering "Create New
-- Gift" (spec section 6). Enforced in application code (app/api/gifts/[id]/route.ts)
-- but documented here as the source of truth for what "minor correction" means.
comment on table gift_edits is
  'Audit trail for post-payment edits. Only whitelisted fields (recipient name, PIN hint, letter text, memory captions, wish text) may be changed here — occasion/theme/game changes require a new gift (see lib/editPolicy.ts).';
