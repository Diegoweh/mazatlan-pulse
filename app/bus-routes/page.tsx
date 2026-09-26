import type { Metadata } from "next";

import { RouteIndex } from "@/components/transport/RouteIndex";
import { Figure } from "@/components/ui/Figure";
import { PageHero } from "@/components/ui/PageHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { busGuideIntro, busGuideSections } from "@/content/bus-guide";
import { breadcrumbSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";
import { formatMxn } from "@/lib/utils";
import { getBusRoutes } from "@/services/transport/queries";

export const metadata: Metadata = {
  title: "How to Ride the Bus in Mazatlán",
  description:
    "How Mazatlán's public buses work: fares, key stops between the Golden Zone, Centro and Cerritos, and a verified guide to each route.",
  alternates: { canonical: "/bus-routes" },
  openGraph: {
    title: "How to Ride the Bus in Mazatlán",
    description:
      "How Mazatlán's public buses work: fares, key stops, and a verified guide to each route.",
    url: "/bus-routes",
  },
};

export default async function BusRoutesPage() {
  const routes = await getBusRoutes();

  // Derived from verified rows, never hand-typed — it can't drift out of date.
  const fares = routes
    .map((route) => route.fare_mxn)
    .filter((fare): fare is number => fare !== null);
  const fareRange =
    fares.length === 0
      ? null
      : Math.min(...fares) === Math.max(...fares)
        ? formatMxn(fares[0])
        : `${formatMxn(Math.min(...fares))}–${formatMxn(Math.max(...fares))}`;

  const written = busGuideSections.filter((section) => section.body.length > 0);

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Bus routes", path: "/bus-routes" },
        ])}
      />

      {/* Aerial over Centro: the city grid the routes actually cross. */}
      <PageHero
        eyebrow="Getting around"
        title="How to ride the bus in Mazatlán"
        intro={busGuideIntro}
        videoSrc="/video/centro-aereo.mp4"
      />

      <div className="page-shell space-y-10">

      {/* This photo is the answer to the first question a visitor has, so it sits
          above the route list rather than being scattered as decoration. */}
      <section className="grid gap-6 sm:grid-cols-5 sm:items-center" aria-labelledby="spotting">
        <Figure
          src="/images/bus-2.webp"
          alt="Two white Mazatlán city buses seen head-on, each with its route hand-lettered across the windshield: Alarcón–Sábalo on one and Juárez–Sábalo on the other."
          imageClassName="aspect-[16/9]"
          sizes="(min-width: 640px) 60vw, 100vw"
          className="sm:col-span-3"
          priority
        />
        <div className="space-y-3 sm:col-span-2">
          <h2 id="spotting" className="font-display text-2xl text-navy">
            How to spot your bus
          </h2>
          <p className="leading-relaxed text-ink/80">
            There are no route numbers on the front. The destinations are written by hand across
            the windshield — read those, not the colour of the bus. If the names match either end
            of the route you want, it&apos;s yours.
          </p>
        </div>
      </section>

      {routes.length > 0 ? (
        <section className="space-y-5" aria-labelledby="routes-heading">
          <div className="border-b border-line pb-3">
            <p className="eyebrow">Route by route</p>
            <h2 id="routes-heading" className="mt-1 font-display text-2xl text-navy sm:text-3xl">
              {routes.length} routes worth knowing
            </h2>
          </div>

          <RouteIndex routes={routes} />

          {fareRange ? (
            <p className="text-sm text-muted">
              Fares on the routes we&apos;ve checked run {fareRange}. Every route below was
              verified in person; we say so on the page when one hasn&apos;t been.
            </p>
          ) : null}
        </section>
      ) : (
        <p className="text-muted">
          Route guides are on the way. Each one is checked in person before it goes up.
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Mazatlán city buses">
        <Figure
          src="/images/bus-3.webp"
          alt="A green Mazatlán city bus pulled over on the seafront malecón, with palm trees and the Pacific behind it."
          imageClassName="aspect-[4/3]"
          sizes="(min-width: 640px) 30vw, 100vw"
          caption="Along the malecón"
        />
        <Figure
          src="/images/bus-4.webp"
          alt="Side view of a white and green Mazatlán city bus at a stop on a palm-lined street."
          imageClassName="aspect-[4/3]"
          sizes="(min-width: 640px) 30vw, 100vw"
          caption="The standard green-and-white livery"
        />
        <Figure
          src="/images/bus-1.webp"
          alt="A line of white and green Mazatlán city buses parked nose to tail along a shaded street."
          imageClassName="aspect-[4/3]"
          sizes="(min-width: 640px) 30vw, 100vw"
          caption="Waiting out the off-peak"
        />
      </section>

      {/* Sections with no verified copy yet simply don't render — an empty
          heading would promise the reader something that isn't there. */}
      {written.length > 0 ? (
        <div className="prose-guide max-w-2xl space-y-8">
          {written.map((section) => (
            <section key={section.id} id={section.id} className="space-y-3">
              <h2>{section.heading}</h2>
              {section.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      ) : null}
      </div>
    </>
  );
}
