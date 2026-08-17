-- Seed data mirroring config/pricing.ts defaults. This is the source of
-- truth once the admin dashboard (Phase 11) goes live — application code
-- reads prices from this table (falling back to config/pricing.ts only in
-- local/dev environments without a Supabase connection).

insert into occasion_settings (occasion, enabled) values
  ('birthday', true),
  ('anniversary', true),
  ('proposal', true),
  ('apology', true),
  ('custom', true),
  ('congratulations', true),
  ('festival', true),
  ('family', true)
on conflict (occasion) do nothing;

-- Flat ₹199-total pricing (see config/pricing.ts for the matching fallback
-- table and rationale): only the base gift carries a price, every other
-- item is seeded at 0 so the total always comes out to ₹199 regardless of
-- what a creator picks.
insert into pricing_config (category, item_key, label, price) values
  ('base', 'gift', 'Base Gift', 199),

  ('theme', 'classic', 'Classic', 0),
  ('theme', 'galaxy', 'Galaxy', 0),
  ('theme', 'emerald', 'Emerald', 0),
  ('theme', 'frost', 'Frost', 0),
  ('theme', 'midnight', 'Midnight', 0),
  ('theme', 'party', 'Party', 0),
  ('theme', 'floating-hearts', 'Floating Hearts', 0),
  ('theme', 'neon-hearts', 'Neon Hearts', 0),
  ('theme', 'sparkle-hearts', 'Sparkle Hearts', 0),
  ('theme', 'two-hearts', 'Two Hearts', 0),
  ('theme', 'romantic-sunset', 'Romantic Sunset', 0),
  ('theme', 'starlight-love', 'Starlight Love', 0),
  ('theme', 'classic-gold', 'Classic Gold', 0),
  ('theme', 'galaxy-violet', 'Galaxy Violet', 0),
  ('theme', 'emerald-teal', 'Emerald Teal', 0),
  ('theme', 'frost-crystal', 'Frost Crystal', 0),

  ('wrap', 'box-classic-pink', 'Classic Pink Box', 0),
  ('wrap', 'box-royal-gold', 'Royal Gold Box', 0),
  ('wrap', 'box-mint-silver', 'Mint & Silver Box', 0),
  ('wrap', 'box-rainbow-pop', 'Rainbow Pop Box', 0),
  ('wrap', 'envelope-classic-cream', 'Classic Cream Envelope', 0),
  ('wrap', 'envelope-rose-gold', 'Rose Gold Envelope', 0),
  ('wrap', 'envelope-midnight-navy', 'Midnight Navy Envelope', 0),
  ('wrap', 'scroll-classic-parchment', 'Classic Parchment Scroll', 0),
  ('wrap', 'scroll-royal-navy', 'Royal Navy Scroll', 0),
  ('wrap', 'scroll-rose-blush', 'Rose Blush Scroll', 0),
  ('wrap', 'chest-classic-oak', 'Classic Oak Chest', 0),
  ('wrap', 'chest-dark-ebony', 'Dark Ebony Chest', 0),
  ('wrap', 'chest-royal-mahogany', 'Royal Mahogany Chest', 0),

  ('game', 'sliding-puzzle', 'Sliding Puzzle', 0),
  ('game', 'memory-match', 'Memory Match', 0),

  ('addon', 'cake-classic-pink', 'Classic Pink Cake', 0),
  ('addon', 'cake-chocolate', 'Chocolate Cake', 0),
  ('addon', 'cake-vanilla-cream', 'Vanilla Cream Cake', 0),
  ('addon', 'cake-rainbow-funfetti', 'Rainbow Funfetti Cake', 0),
  ('addon', 'cake-red-velvet', 'Red Velvet Cake', 0),

  ('addon', 'scratch-card', 'One Last Surprise (Scratch Card)', 0),
  ('addon', 'pop-wishes', 'Pop the Wishes (up to 7 balloons)', 0),
  ('addon', 'custom-song-upload', 'Custom Song Upload', 0)
on conflict (category, item_key) do nothing;
