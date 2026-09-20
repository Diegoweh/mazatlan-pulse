import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { getPublishedEventIndex } from "@/services/events/queries";
import { getBusRoutes } from "@/services/transport/queries";

/**
 * Dynamic sitemap. Both data sources are `use cache`-backed, so crawler traffic
 * doesn't translate into Supabase queries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
