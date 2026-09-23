import { cacheLife, cacheTag } from "next/cache";

import { getPublicSupabase } from "@/lib/supabase/public";
import type { BusRouteRow } from "@/types";

export const BUS_ROUTES_CACHE_TAG = "bus-routes";

/**
 * Bus routes are curated by hand and change maybe twice a year, so they get the
 * longest cache profile on the site. Verification edits call
 * revalidateTag(BUS_ROUTES_CACHE_TAG).
 */
export async function getBusRoutes(): Promise<BusRouteRow[]> {
  "use cache";
  cacheLife("days");
  cacheTag(BUS_ROUTES_CACHE_TAG);

  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bus_routes")
    .select("*")
    .eq("is_active", true)
    // Editor-controlled first, alphabetical as the tiebreaker so the order is
    // always deterministic even when everything sits at the default 0.
    .order("sort_order", { ascending: true })
    .order("route_name", { ascending: true });

  if (error) {
    console.error("[transport] getBusRoutes failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getBusRouteBySlug(slug: string): Promise<BusRouteRow | null> {
  "use cache";
  cacheLife("days");
  cacheTag(BUS_ROUTES_CACHE_TAG, `bus-route-${slug}`);

  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("bus_routes")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[transport] getBusRouteBySlug failed:", error.message);
    return null;
  }
  return data;
}
