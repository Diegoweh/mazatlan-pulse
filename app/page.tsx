import Link from "next/link";

import { EventCard } from "@/components/events/EventCard";
import { TourAffiliateWidget } from "@/components/tours/TourAffiliateWidget";
import { siteConfig } from "@/lib/site";
import { formatMxn } from "@/lib/utils";
import { getAffiliateDeals } from "@/services/affiliates/queries";
import { getUpcomingEvents } from "@/services/events/queries";
import { getBusRoutes } from "@/services/transport/queries";

export default async function HomePage() {
  // Independent reads — fire them together rather than waterfalling.
  const [events, deals, routes] = await Promise.all([
    getUpcomingEvents({ limit: 6 }),
    getAffiliateDeals({ featuredOnly: true, limit: 4 }),
    getBusRoutes(),
  ]);

  return (
    <div className="space-y-20">
      <section className="relative">
        <p className="eyebrow">
          {siteConfig.city.name}, {siteConfig.city.region} · in English
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.08] text-navy sm:text-5xl md:text-6xl">
          Get around Mazatlán like you{" "}
          <span className="relative whitespace-nowrap">
            <span className="relative z-10">already live here</span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-1 z-0 h-3 bg-coral/35 sm:bottom-2"
            />
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/75">
          Real bus routes with real stops and fares, what&apos;s on tonight, and the handful of
          tours actually worth booking. No cruise-ship markup.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/bus-routes" className="btn-primary px-5 py-2.5 text-sm">
            Ride the buses
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-teal hover:text-teal-ink"
          >
            What&apos;s on
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
          <div>
            <p className="eyebrow">Getting around</p>
            <h2 className="mt-1 font-display text-2xl text-navy sm:text-3xl">Bus routes</h2>
          </div>
          <Link href="/bus-routes" className="text-sm font-semibold text-teal-ink hover:underline">
            All routes →
          </Link>
        </div>

        {routes.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {routes.slice(0, 4).map((route) => (
              <li key={route.id}>
                <Link
                  href={`/bus-routes/${route.slug}`}
                  className="card card-interactive flex h-full flex-col gap-2 p-5"
                >
                  <span className="font-display text-lg text-navy">{route.route_name}</span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="pill bg-teal-wash text-teal-ink">
                      {route.key_stops.length} stops
                    </span>
                    {route.fare_mxn !== null ? (
                      <span className="pill bg-coral-wash text-coral-ink">
                        {formatMxn(route.fare_mxn)}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Route guides are on the way.</p>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
          <div>
            <p className="eyebrow">This week</p>
            <h2 className="mt-1 font-display text-2xl text-navy sm:text-3xl">Upcoming events</h2>
          </div>
          <Link href="/events" className="text-sm font-semibold text-teal-ink hover:underline">
            All events →
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} priority={index < 3} />
            ))}
          </div>
        ) : (
          <p className="text-muted">
            No events listed right now. We check local listings regularly — check back soon.
          </p>
        )}
      </section>

      <TourAffiliateWidget deals={deals} placement="grid" heading="Popular tours & transfers" />
    </div>
  );
}
