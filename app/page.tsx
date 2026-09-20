import Link from "next/link";

import { EventCard } from "@/components/events/EventCard";
import { TourAffiliateWidget } from "@/components/tours/TourAffiliateWidget";
import { siteConfig } from "@/lib/site";
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
    <div className="space-y-14">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          What&apos;s happening in {siteConfig.city.name}
        </h1>
        <p className="max-w-2xl text-black/70 dark:text-white/70">{siteConfig.description}</p>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Upcoming events</h2>
          <Link href="/events" className="text-sm hover:underline">
            All events →
          </Link>
        </div>
        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} priority={index < 3} />
            ))}
          </div>
        ) : (
          <p className="text-black/60 dark:text-white/60">
            No published events yet. Approved listings appear here once they clear review.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Getting around by bus</h2>
          <Link href="/bus-routes" className="text-sm hover:underline">
            All routes →
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {routes.slice(0, 4).map((route) => (
            <li key={route.id}>
              <Link
                href={`/bus-routes/${route.slug}`}
                className="block rounded-xl border border-black/10 p-4 hover:shadow-md dark:border-white/15"
              >
                <p className="font-semibold">{route.route_name}</p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {route.key_stops.length} key stops
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <TourAffiliateWidget deals={deals} placement="grid" heading="Popular tours & transfers" />
    </div>
  );
}
