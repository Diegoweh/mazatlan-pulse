-- Mazatlán Pulse — seed data for local dev (`supabase db reset` runs this).
--
-- IMPORTANT: bus_routes rows below are PLACEHOLDERS with `last_verified_at = null`.
-- Fares, stops and coordinates must be checked on the ground (or against a current
-- local source) and the row updated with last_verified_at = now() before it is
-- treated as published-quality content. The site should badge unverified routes.

insert into public.sources (name, base_url, scrape_config, is_active, notes)
values
  (
    'Example Mazatlán Events Listing',
    'https://example.com/eventos',
    jsonb_build_object(
      'listSelector', '.event-card',
      'titleSelector', 'h3',
      'linkSelector', 'a',
      'dateSelector', '.event-date',
      'timezone', 'America/Mazatlan',
      'maxPages', 2
    ),
    false,
    'Placeholder source. Replace with a real listing and confirm its terms of use allow summarization + attribution before activating.'
  )
on conflict (base_url) do nothing;

insert into public.bus_routes (
  slug, route_name, route_number, color_hex, fare_mxn, fare_notes,
  key_stops, route_path, tourist_tips_en, operating_hours, frequency_notes,
  last_verified_at, is_active
) values
  (
    'sabalo-centro',
    'Sábalo–Centro',
    'SC',
    '#1D9BF0',
    null,
    'Fare unverified — confirm current price and whether the air-conditioned units cost more.',
    '[
      {"name": "Golden Zone (Av. Camarón Sábalo)", "lat": 23.2586, "lng": -106.4553, "order": 1},
      {"name": "Valentinos / Punta Camarón",       "lat": 23.2462, "lng": -106.4498, "order": 2},
      {"name": "Fisherman''s Monument",            "lat": 23.2202, "lng": -106.4335, "order": 3},
      {"name": "Centro / Mercado Pino Suárez",     "lat": 23.2085, "lng": -106.4197, "order": 4}
    ]'::jsonb,
    '[]'::jsonb,
    'The workhorse route for visitors: it links the Golden Zone hotels with Old Town along the malecón. Flag it down at any corner, pay the driver on boarding, and press the buzzer or call "¡baja!" before your stop.',
    'Roughly early morning to late evening daily — verify locally.',
    'Frequent; exact headway unverified.',
    null,
    true
  ),
  (
    'cerritos-juarez',
    'Cerritos–Juárez',
    'CJ',
    '#16A34A',
    null,
    'Fare unverified.',
    '[
      {"name": "Cerritos / North Beaches", "lat": 23.3033, "lng": -106.4783, "order": 1},
      {"name": "Marina Mazatlán",          "lat": 23.2770, "lng": -106.4640, "order": 2},
      {"name": "Golden Zone",              "lat": 23.2586, "lng": -106.4553, "order": 3},
      {"name": "Centro",                   "lat": 23.2085, "lng": -106.4197, "order": 4}
    ]'::jsonb,
    '[]'::jsonb,
    'Useful if you are staying north of the Marina. Covers the long stretch of newer development between Cerritos and downtown.',
    'Verify locally.',
    'Verify locally.',
    null,
    true
  )
on conflict (slug) do nothing;

insert into public.affiliate_deals (
  slug, title, category, provider, affiliate_url, estimated_commission_pct,
  image_url, location_name, short_description_en, is_featured, is_active, sort_order
) values
  (
    'old-town-food-walking-tour',
    'Old Town Mazatlán Food Walking Tour',
    'tour',
    'viator',
    'https://www.viator.com/REPLACE-WITH-AFFILIATE-LINK',
    8.00,
    null,
    'Centro Histórico',
    'Guided walk through Plazuela Machado with tastings of regional Sinaloan food.',
    true,
    false,
    10
  ),
  (
    'airport-private-transfer',
    'Mazatlán Airport Private Transfer',
    'airport_transfer',
    'getyourguide',
    'https://www.getyourguide.com/REPLACE-WITH-AFFILIATE-LINK',
    8.00,
    null,
    'Mazatlán International Airport (MZT)',
    'Pre-booked private car from MZT to Golden Zone, Centro or Cerritos hotels.',
    true,
    false,
    20
  )
on conflict (slug) do nothing;
