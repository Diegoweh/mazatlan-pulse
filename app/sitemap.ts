import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { absoluteUrl } from "@/lib/site";
import { EVENTS_CACHE_TAG, getPublishedEventIndex } from "@/services/events/queries";
import { BUS_ROUTES_CACHE_TAG, getBusRoutes } from "@/services/transport/queries";

/**
 * Dynamic sitemap.
 *
 * The `use cache` + cacheTag here is load-bearing: tagging only the inner query
 * functions was not enough, because this route gets its own cache entry and
 * updateTag() from the admin did not reach it — publishing a route left the
 * sitemap stale for its full lifetime. Tagging the route itself means an approval
 * or a route save invalidates this output too.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");
  cacheTag(EVENTS_CACHE_TAG, BUS_ROUTES_CACHE_TAG);

  const [events, routes] = await Promise.all([getPublishedEventIndex(), getBusRoutes()]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/events"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/bus-routes"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/tours"), changeFrequency: "weekly", priority: 0.8 },
  ];

  return [
    ...staticEntries,
    ...events.map((event) => ({
      url: absoluteUrl(`/events/${event.slug}`),
      lastModified: new Date(event.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...routes.map((route) => ({
      url: absoluteUrl(`/bus-routes/${route.slug}`),
      lastModified: new Date(route.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
