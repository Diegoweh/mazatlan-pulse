-- Mazatlán Pulse — controlled write paths for anon clients.
--
-- Click tracking is the one thing a browser needs to write. Rather than opening an
-- UPDATE policy on affiliate_deals, expose a single security-definer RPC that can
-- only ever bump a counter on an active row.

create or replace function public.increment_affiliate_click(deal_slug text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.affiliate_deals
     set click_count = click_count + 1
   where slug = deal_slug
     and is_active;
$$;

revoke all on function public.increment_affiliate_click(text) from public;
grant execute on function public.increment_affiliate_click(text) to anon, authenticated;

-- Approval helper used by the admin review UI (called with the service_role key).
-- Keeps the published-requires-review invariant in one place.
create or replace function public.publish_event(event_id uuid, reviewer uuid)
returns public.events
language sql
as $$
  update public.events
     set status      = 'published',
         reviewed_by = reviewer,
         reviewed_at = now()
   where id = event_id
  returning *;
$$;

revoke all on function public.publish_event(uuid, uuid) from public, anon, authenticated;
