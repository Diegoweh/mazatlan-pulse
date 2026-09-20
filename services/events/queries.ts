import { cacheLife, cacheTag } from "next/cache";

import { getPublicSupabase } from "@/lib/supabase/public";
import { PUBLIC_EVENT_COLUMNS, type EventCategory, type PublicEvent } from "@/types";

/**
 * Column list, not `select("*")`. The anon role has no table-wide SELECT grant on
 * `events` — description_original is walled off at the database level — so a star
 * select would be rejected.
 */
const PUBLIC_COLUMNS = PUBLIC_EVENT_COLUMNS.join(", ");

export const EVENTS_CACHE_TAG = "events";

/**
 * Upcoming published events.
 *
 * `use cache` + cacheLife is the ISR story under Cache Components: pages render
 * from the cache, Supabase is hit on revalidation, and an admin approval calls
 * revalidateTag(EVENTS_CACHE_TAG) to push the change out early.
 */
export async function getUpcomingEvents(options?: {
  category?: EventCategory;
  limit?: number;
}): Promise<PublicEvent[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(EVENTS_CACHE_TAG);

  const supabase = getPublicSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("events")
    .select(PUBLIC_COLUMNS)
    .eq("status", "published")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(options?.limit ?? 50);

  if (options?.category) query = query.eq("category", options.category);

  const { data, error } = await query;
  if (error) {
    console.error("[events] getUpcomingEvents failed:", error.message);
    return [];
  }
  return (data ?? []) as unknown as PublicEvent[];
}

export async function getEventBySlug(slug: string): Promise<PublicEvent | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(EVENTS_CACHE_TAG, `event-${slug}`);

  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[events] getEventBySlug failed:", error.message);
    return null;
  }
  return (data ?? null) as unknown as PublicEvent | null;
}

/** Slug + updated_at only — feeds sitemap.ts. */
export async function getPublishedEventIndex(): Promise<
  { slug: string; updated_at: string }[]
> {
  "use cache";
  cacheLife("hours");
  cacheTag(EVENTS_CACHE_TAG);

  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(5000);

  if (error) {
    console.error("[events] getPublishedEventIndex failed:", error.message);
    return [];
  }
  return (data ?? []) as unknown as { slug: string; updated_at: string }[];
}
