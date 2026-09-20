-- Mazatlán Pulse — core schema
-- Enums, tables, indexes, updated_at triggers.
-- RLS lives in 20260919120100_rls_policies.sql.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.content_status as enum (
  'pending_review',
  'published',
  'archived',
  'rejected'
);

create type public.event_category as enum (
  'music',
  'nightlife',
  'festival',
  'sports',
  'food_drink',
  'arts_culture',
  'family',
  'community',
  'other'
);

create type public.affiliate_category as enum (
  'tour',
  'activity',
  'hotel',
  'car_rental',
  'airport_transfer',
  'insurance',
  'other'
);

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at honest
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- sources — scraping provenance
-- ---------------------------------------------------------------------------

create table public.sources (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  base_url       text not null,
  -- Per-source selectors/pagination/timezone for the scraper, e.g.
  -- {"listSelector": ".event-card", "titleSelector": "h3", "timezone": "America/Mazatlan"}
  scrape_config  jsonb not null default '{}'::jsonb,
  is_active      boolean not null default true,
  last_scraped_at timestamptz,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint sources_base_url_key unique (base_url),
  constraint sources_scrape_config_is_object check (jsonb_typeof(scrape_config) = 'object')
);

create index sources_is_active_idx on public.sources (is_active) where is_active;

create trigger sources_set_updated_at
  before update on public.sources
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- events — AI-assisted, never auto-published
-- ---------------------------------------------------------------------------

create table public.events (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null,
  title               text not null,
  -- Public, tourist-facing English. LLM summary/translation, never a verbatim copy.
  description_en      text,
  -- Audit only. Raw scraped text. NEVER rendered publicly (see RLS + query layer).
  description_original text,
  category            public.event_category not null default 'other',
  starts_at           timestamptz not null,
  ends_at             timestamptz,
  venue_name          text,
  address             text,
  lat                 numeric(9,6),
  lng                 numeric(9,6),
  price_info          text,
  image_url           text,
  ticket_url          text,
  -- Attribution: source_id can go null if a source is retired, the snapshot fields stay.
  source_id           uuid references public.sources (id) on delete set null,
  source_name         text not null,
  source_url          text not null,
  ai_generated        boolean not null default false,
  ai_model            text,
  status              public.content_status not null default 'pending_review',
  reviewed_by         uuid references auth.users (id) on delete set null,
  reviewed_at         timestamptz,
  review_notes        text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint events_slug_key unique (slug),
  -- Dedupe key for the ingest pipeline.
  constraint events_source_url_key unique (source_url),
  constraint events_ends_after_start check (ends_at is null or ends_at >= starts_at),
  constraint events_lat_range check (lat is null or lat between -90 and 90),
  constraint events_lng_range check (lng is null or lng between -180 and 180),
  -- A published row must have been looked at by a human.
  constraint events_published_requires_review check (
    status <> 'published' or (reviewed_by is not null and reviewed_at is not null)
  )
);

-- Public listing: published events, upcoming first.
create index events_published_starts_at_idx
  on public.events (starts_at)
  where status = 'published';

create index events_category_starts_at_idx
  on public.events (category, starts_at)
  where status = 'published';

-- Admin review queue.
create index events_status_created_at_idx on public.events (status, created_at desc);

create index events_source_id_idx on public.events (source_id);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- bus_routes — curated by hand, not scraped
-- ---------------------------------------------------------------------------

create table public.bus_routes (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null,
  route_name       text not null,
  route_number     text,
  color_hex        text,
  fare_mxn         numeric(6,2),
  fare_notes       text,
  -- [{ "name": "Golden Zone", "lat": 23.2586, "lng": -106.4553, "order": 1 }, ...]
  key_stops        jsonb not null default '[]'::jsonb,
  -- Plain coordinate array for drawing the line. No PostGIS for now.
  -- [[23.2586, -106.4553], [23.2100, -106.4200], ...]
  route_path       jsonb not null default '[]'::jsonb,
  tourist_tips_en  text,
  operating_hours  text,
  frequency_notes  text,
  last_verified_at timestamptz,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint bus_routes_slug_key unique (slug),
  constraint bus_routes_key_stops_is_array check (jsonb_typeof(key_stops) = 'array'),
  constraint bus_routes_route_path_is_array check (jsonb_typeof(route_path) = 'array'),
  constraint bus_routes_color_hex_format check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

create index bus_routes_active_name_idx
  on public.bus_routes (route_name)
  where is_active;

create trigger bus_routes_set_updated_at
  before update on public.bus_routes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- affiliate_deals — hand-picked monetization inventory
-- ---------------------------------------------------------------------------

create table public.affiliate_deals (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text not null,
  title                    text not null,
  category                 public.affiliate_category not null default 'tour',
  -- 'viator' | 'getyourguide' | 'tripadvisor' | 'booking' | 'discovercars' | ...
  provider                 text not null,
  affiliate_url            text not null,
  estimated_commission_pct numeric(5,2),
  price_from_usd           numeric(10,2),
  image_url                text,
  location_name            text,
  short_description_en     text,
  is_featured              boolean not null default false,
  is_active                boolean not null default true,
  sort_order               integer not null default 0,
  click_count              bigint not null default 0,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint affiliate_deals_slug_key unique (slug),
  constraint affiliate_deals_commission_range check (
    estimated_commission_pct is null or estimated_commission_pct between 0 and 100
  ),
  constraint affiliate_deals_click_count_positive check (click_count >= 0)
);

create index affiliate_deals_active_sort_idx
  on public.affiliate_deals (category, sort_order, created_at desc)
  where is_active;

create index affiliate_deals_featured_idx
  on public.affiliate_deals (sort_order)
  where is_active and is_featured;

create trigger affiliate_deals_set_updated_at
  before update on public.affiliate_deals
  for each row execute function public.set_updated_at();
