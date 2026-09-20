-- Mazatlán Pulse — Row Level Security
--
-- Model:
--   * anon / authenticated  -> read-only, and only rows that are published/active.
--   * service_role          -> full access (it bypasses RLS entirely; no policy needed).
--
-- There are deliberately NO insert/update/delete policies. Every write goes through
-- the backend using the service_role key (ingest scripts + admin server actions).

alter table public.sources          enable row level security;
alter table public.events           enable row level security;
alter table public.bus_routes       enable row level security;
alter table public.affiliate_deals  enable row level security;

-- Force RLS on the table owner too, so a stray owner-context query can't leak rows.
alter table public.events          force row level security;
alter table public.bus_routes      force row level security;
alter table public.affiliate_deals force row level security;
alter table public.sources         force row level security;

-- ---------------------------------------------------------------------------
-- sources: no public access at all (scrape_config can hold selectors/keys)
-- ---------------------------------------------------------------------------

revoke all on public.sources from anon, authenticated;

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------

create policy "events_public_read_published"
  on public.events
  for select
  to anon, authenticated
  using (status = 'published');

-- Column-level privileges: description_original is audit-only and must never reach
-- a client. RLS is row-level, so the column is walled off with GRANTs instead.
-- (Consequence: `select *` fails for anon — the query layer lists columns explicitly.)
revoke all on public.events from anon, authenticated;
grant select (
  id, slug, title, description_en, category, starts_at, ends_at,
  venue_name, address, lat, lng, price_info, image_url, ticket_url,
  source_name, source_url, ai_generated, status, created_at, updated_at
) on public.events to anon, authenticated;

-- ---------------------------------------------------------------------------
-- bus_routes
-- ---------------------------------------------------------------------------

create policy "bus_routes_public_read_active"
  on public.bus_routes
  for select
  to anon, authenticated
  using (is_active);

revoke all on public.bus_routes from anon, authenticated;
grant select on public.bus_routes to anon, authenticated;

-- ---------------------------------------------------------------------------
-- affiliate_deals
-- ---------------------------------------------------------------------------

create policy "affiliate_deals_public_read_active"
  on public.affiliate_deals
  for select
  to anon, authenticated
  using (is_active);

revoke all on public.affiliate_deals from anon, authenticated;
grant select on public.affiliate_deals to anon, authenticated;
