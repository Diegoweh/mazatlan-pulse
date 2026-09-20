import { absoluteUrl, siteConfig } from "@/lib/site";
import type { AffiliateDealRow, BusRouteRow, PublicEvent } from "@/types";

type JsonLdObject = Record<string, unknown>;

const cityAddress = {
  "@type": "PostalAddress",
  addressLocality: siteConfig.city.name,
  addressRegion: siteConfig.city.region,
  addressCountry: siteConfig.city.country,
} as const;

export function websiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * schema.org/Event. Only emitted for published events — mirrors what the page shows,
 * which is what Google requires of structured data.
 */
export function eventSchema(event: PublicEvent): JsonLdObject {
  const location: JsonLdObject = {
    "@type": "Place",
    name: event.venue_name ?? siteConfig.city.name,
    address: event.address
      ? { ...cityAddress, streetAddress: event.address }
      : cityAddress,
  };

  if (event.lat !== null && event.lng !== null) {
    location.geo = { "@type": "GeoCoordinates", latitude: event.lat, longitude: event.lng };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description_en ?? undefined,
    startDate: event.starts_at,
    endDate: event.ends_at ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl(`/events/${event.slug}`),
    image: event.image_url ?? undefined,
    location,
    offers: event.ticket_url
      ? {
          "@type": "Offer",
          url: event.ticket_url,
          availability: "https://schema.org/InStock",
        }
      : undefined,
    // Attribution: we summarize and translate, the listing itself belongs to the source.
    isBasedOn: event.source_url,
  };
}

/** schema.org/TouristAttraction for tours and activities we link out to. */
export function touristAttractionSchema(deal: AffiliateDealRow): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: deal.title,
    description: deal.short_description_en ?? undefined,
    image: deal.image_url ?? undefined,
    url: absoluteUrl(`/tours#${deal.slug}`),
    touristType: "Leisure travelers",
    address: deal.location_name
      ? { ...cityAddress, streetAddress: deal.location_name }
      : cityAddress,
  };
}

/** Bus routes render as BusTrip so stop lists are machine-readable. */
export function busRouteSchema(route: BusRouteRow): JsonLdObject {
  const stops = [...route.key_stops].sort((a, b) => a.order - b.order);

  return {
    "@context": "https://schema.org",
    "@type": "BusTrip",
    name: route.route_name,
    description: route.tourist_tips_en ?? undefined,
    url: absoluteUrl(`/bus-routes/${route.slug}`),
    departureBusStop: stops.length
      ? { "@type": "BusStop", name: stops[0].name }
      : undefined,
    arrivalBusStop: stops.length
      ? { "@type": "BusStop", name: stops[stops.length - 1].name }
      : undefined,
    provider: { "@type": "Organization", name: "Mazatlán public transit" },
  };
}

/** Strips undefined so we never ship `"key": null` noise to crawlers. */
export function serializeJsonLd(schema: JsonLdObject): string {
  return JSON.stringify(schema, (_key, value) => (value === undefined ? undefined : value));
}
