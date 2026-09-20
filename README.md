# Mazatlán Pulse

English-language guide to Mazatlán, Sinaloa for US/Canadian visitors and expats: curated public bus routes, hand-picked affiliate tours, and (phase 2) an AI-assisted event feed that never auto-publishes.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres + RLS) · Anthropic API for event extraction · Vercel.

## Getting started

```bash
cp .env.example .env.local   # fill in Supabase + Anthropic values
npm install
npm run dev
```

Without Supabase env vars the app still builds and runs — every query returns an empty result and pages render their empty states.

### Database

```bash
supabase start          # local Postgres
npm run db:reset        # applies supabase/migrations/* then supabase/seed.sql
npm run db:types        # regenerate types/database.ts from the live schema
```

Migrations, in order:

| File | What it does |
|---|---|
| `20260919120000_init_schema.sql` | enums, `sources` / `events` / `bus_routes` / `affiliate_deals`, indexes, `updated_at` triggers |
| `20260919120100_rls_policies.sql` | RLS: public read of published/active rows only; no anon write policies anywhere |
| `20260919120200_functions.sql` | `increment_affiliate_click` (the one anon write path) and `publish_event` |

## Architecture notes

**Writes go through `service_role`, always.** There are no insert/update/delete policies on any table. The ingest script, the cron route and the admin server actions use `lib/supabase/admin.ts`; browsers only ever read. The single exception is click tracking, which goes through a `security definer` function that can only bump a counter.

**`description_original` is walled off at the database.** RLS is row-level, so the raw scraped text is protected with column-level GRANTs instead: `anon` has no table-wide `SELECT` on `events`, only an explicit column list. That is why the query layer selects columns by name and never `*`.

**Nothing AI-generated auto-publishes.** `runEventIngest()` inserts with `status = 'pending_review'`. `/admin/review` is the only path to `published`, and a CHECK constraint refuses a published row without `reviewed_by` + `reviewed_at`.

**Bus routes are curated, not scraped.** They live in `bus_routes` with a `last_verified_at` timestamp; the UI badges any route that has never been verified on the ground. Seeded rows ship unverified on purpose.

**Caching is Cache Components, not `revalidate`.** Next 16 replaces the old ISR exports: query functions in `services/*/queries.ts` carry `'use cache'` + `cacheLife()` + `cacheTag()`, so pages serve from cache and Supabase is only hit on revalidation. Approving an event calls `updateTag('events')`, which refreshes the public pages in the same request.

Dynamic routes deliberately have no `generateStaticParams` yet — with Cache Components it must return at least one entry, and the tables are empty at build time. Each page instead prerenders an App Shell (the `params` await lives inside a `<Suspense>` boundary) and ISR upgrades it on first visit. Re-add it once there is content; the commented-out version is in each page file.

## Ingest pipeline (phase 2)

```
Vercel Cron (vercel.json, 09:00 UTC daily)
  └─ GET /api/cron/ingest-events        auth: Bearer $CRON_SECRET
       └─ runEventIngest()
            ├─ active rows from `sources`
            ├─ scrapeSource()      Cheerio over scrape_config selectors
            ├─ filterNewItems()    dedupe on events.source_url (all statuses)
            ├─ extractEvent()      Claude structured outputs (zod schema, not free-text JSON)
            ├─ validate()          required fields, parseable + future date, plausible horizon, confidence floor
            └─ upsert status='pending_review'
```

Run it by hand: `npm run ingest:events` (or `-- --source=<uuid>`).

Every row keeps `source_name` + `source_url` for attribution and `description_original` for audit. The public description is an LLM summary written for a visitor, never a verbatim copy of the source.

## Layout

```
app/          routes, sitemap.ts, robots.ts, /admin/review, /api/cron/*
components/   events/ tours/ transport/ ui/
lib/          supabase clients, schema-org helpers, site config, auth gate
services/     scraping/ ai/ events/ affiliates/ transport/
scripts/      cron entry points
supabase/     migrations/ + seed.sql
types/        database types (regenerate with npm run db:types)
```

## Before launch

- [ ] Verify every `bus_routes` row on the ground, set `last_verified_at`
- [ ] Replace placeholder affiliate URLs and set `is_active = true`
- [ ] Confirm each source's terms of use permit summarization with attribution before setting `is_active = true`
- [ ] Set `ADMIN_EMAILS` and confirm `/admin/review` rejects everyone else
- [ ] Point `NEXT_PUBLIC_SITE_URL` at the real domain (canonicals, sitemap, JSON-LD all read it)
- [ ] Add `app/opengraph-image.tsx` — there is no OG image yet
