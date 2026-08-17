-- Persists the actual charged amount on the gift itself (spec sections 9 &
-- 45: pricing must be dynamic, real, and auditable — not recomputed/guessed
-- after the fact for admin reporting). Previously only the transient price
-- breakdown shown at creation time existed; nothing durable recorded what a
-- gift was actually charged, which the admin "Orders"/stats views need.

alter table gifts add column if not exists amount numeric(10, 2) not null default 0;

-- payments.amount was being hardcoded to 0 at verification time — now that
-- gifts.amount exists, application code (app/api/payments/verify/route.ts)
-- populates it from the gift's own recorded amount instead.
