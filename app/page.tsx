import Link from "next/link";

import { EventCard } from "@/components/events/EventCard";
import { HeroVideo } from "@/components/home/HeroVideo";
import { TourAffiliateWidget } from "@/components/tours/TourAffiliateWidget";
import { RouteIndex } from "@/components/transport/RouteIndex";
import { siteConfig } from "@/lib/site";
import { getAffiliateDeals } from "@/services/affiliates/queries";
import { getUpcomingEvents } from "@/services/events/queries";
import { getBusRoutes } from "@/services/transport/queries";

/**
 * Self-hosted: our bandwidth, our cache headers, nobody else deciding whether
 * the hero keeps working. If the file is ever missing the gradient stands alone,
 * which is a perfectly good hero on its own.
 *
 * Source clip: 1600x900, 21.6s, no audio track, faststart already applied.
 */
const HERO_VIDEO_SRC = "/video/hero.mp4";

export default async function HomePage() {
  // Independent reads — fire them together rather than waterfalling.
  const [events, deals, routes] = await Promise.all([
    getUpcomingEvents({ limit: 6 }),
    getAffiliateDeals({ featuredOnly: true, limit: 4 }),
    getBusRoutes(),
  ]);

  return (
    <>
      {/* Full-bleed: sits outside .page-shell, so it spans the viewport without
          100vw tricks that would add a horizontal scrollbar. */}
      <section className="relative isolate overflow-hidden bg-navy">
        {/* Always-present base, so the hero never renders empty or shifts. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_100%_at_15%_0%,#1c3d4a_0%,#102a35_55%,#0b1e26_100%)]"
        />

        <HeroVideo
          src={HERO_VIDEO_SRC}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div aria-hidden className="hero-scrim absolute inset-0" />

        <div className="relative mx-auto w-full max-w-5xl px-5 py-20 sm:px-6 sm:py-28 lg:py-32">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-coral">
            {siteConfig.city.name}, {siteConfig.city.region}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.08] text-white drop-shadow-sm sm:text-5xl md:text-[3.4rem]">
            Get around Mazatlán like you already live here
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-sand/90">
            Real bus routes with real stops and fares, what&apos;s on tonight, and the handful of
            tours actually worth booking. No cruise-ship markup.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bus-routes" className="btn-primary px-5 py-2.5 text-sm">
              Ride the buses
            </Link>
            <Link
              href="/events"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/70 hover:bg-white/10"
            >
              What&apos;s on
            </Link>
          </div>
        </div>
      </section>

      <div className="page-shell space-y-20">
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
          <RouteIndex routes={routes.slice(0, 4)} />
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
    </>
  );
}
