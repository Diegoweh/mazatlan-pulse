-- Manual ordering for bus routes.
--
-- Alphabetical order buries the route most visitors actually need. This lets the
-- editor put the Golden Zone ↔ Centro workhorse first, the way affiliate_deals
-- already works.
--
-- Additive and reversible: every existing row gets 0 and keeps its current
-- relative order via the route_name tiebreaker in the query layer.

alter table public.bus_routes
  add column if not exists sort_order integer not null default 0;

-- Matches the public query: active routes, ordered by sort_order then name.
drop index if exists public.bus_routes_active_name_idx;

create index bus_routes_active_sort_idx
  on public.bus_routes (sort_order, route_name)
  where is_active;
