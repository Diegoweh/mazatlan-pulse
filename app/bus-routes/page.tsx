import type { Metadata } from "next";

import { RouteIndex } from "@/components/transport/RouteIndex";
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
    <div className="page-shell space-y-10">
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Bus routes", path: "/bus-routes" },
        ])}
      />

      <header className="max-w-2xl">
        <p className="eyebrow">Getting around</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-navy sm:text-5xl">
          How to ride the bus in Mazatlán
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink/80">{busGuideIntro}</p>
      </header>

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
  );
}
