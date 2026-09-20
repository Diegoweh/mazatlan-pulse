import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { TourAffiliateWidget } from "@/components/tours/TourAffiliateWidget";
import { BusRouteMap } from "@/components/transport/BusRouteMap";
import { JsonLd } from "@/components/ui/JsonLd";
import { leadParagraph, toProse } from "@/lib/prose";
import { breadcrumbSchema, busRouteSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";
import { formatMxn, truncateForMeta } from "@/lib/utils";
import { getAffiliateDeals } from "@/services/affiliates/queries";
import { getBusRouteBySlug } from "@/services/transport/queries";

// Same as /events/[slug]: re-add generateStaticParams (mapping getBusRoutes() to
// { slug }) once routes exist at build time. Cache Components rejects one that
// returns an empty array.

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = await getBusRouteBySlug(slug);
  if (!route) return { title: "Route not found" };

  const title = `${route.route_name} Bus Route`;
  const description =
    truncateForMeta(leadParagraph(toProse(route.tourist_tips_en, route.route_name))) ??
    `Stops, fare and rider tips for the ${route.route_name} bus in Mazatlán.`;

  return {
    title,
    description,
    alternates: { canonical: `/bus-routes/${route.slug}` },
    // Without this the page inherits the root layout's OG tags, so every route
    // would share one title and point og:url at the homepage.
    openGraph: { type: "article", title, description, url: `/bus-routes/${route.slug}` },
  };
}

async function RouteDetail({ params }: Props) {
  const { slug } = await params;
  const route = await getBusRouteBySlug(slug);
  if (!route) notFound();

  const deals = await getAffiliateDeals({ category: "airport_transfer", limit: 2 });
  const tips = toProse(route.tourist_tips_en, route.route_name);

  return (
    <>
      <JsonLd schema={busRouteSchema(route)} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Bus routes", path: "/bus-routes" },
          { name: route.route_name, path: `/bus-routes/${route.slug}` },
        ])}
      />

      <header className="space-y-4">
        <p className="eyebrow">Bus route</p>
        <h1 className="font-display text-4xl leading-tight text-navy sm:text-5xl">
          {route.route_name}
        </h1>

        <dl className="flex flex-wrap gap-2">
          {route.fare_mxn !== null ? (
            <div className="pill bg-coral-wash text-coral-ink">
              <dt className="sr-only">Fare</dt>
              <dd>{formatMxn(route.fare_mxn)}</dd>
            </div>
          ) : null}
          {route.operating_hours ? (
            <div className="pill bg-teal-wash text-teal-ink">
              <dt className="sr-only">Hours</dt>
              <dd>{route.operating_hours}</dd>
            </div>
          ) : null}
          {route.frequency_notes ? (
            <div className="pill bg-teal-wash text-teal-ink">
              <dt className="sr-only">Frequency</dt>
              <dd>{route.frequency_notes}</dd>
            </div>
          ) : null}
          <div className="pill bg-navy/5 text-navy">
            <dt className="sr-only">Stops</dt>
            <dd>{route.key_stops.length} key stops</dd>
          </div>
        </dl>

        {route.last_verified_at ? (
          <p className="text-xs text-muted">
            Verified in person on{" "}
            {new Date(route.last_verified_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            .
          </p>
        ) : (
          <p className="rounded-lg border-l-2 border-coral bg-coral-wash px-4 py-3 text-sm text-coral-ink">
            Not yet verified on the ground — treat the stops and fare as provisional.
          </p>
        )}
      </header>

      {/* Real headings and paragraphs: the field holds structured prose, and a
          single <p> would flatten both the sections and the paragraph breaks. */}
      {tips.length > 0 ? (
        <div className="prose-guide max-w-2xl space-y-5">
          {tips.map((block, index) => (
            <div key={index} className="space-y-2">
              {block.heading ? <h2>{block.heading}</h2> : null}
              {block.body ? <p>{block.body}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      <BusRouteMap stops={route.key_stops} path={route.route_path} />

      {route.fare_notes ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted">{route.fare_notes}</p>
      ) : null}

      <TourAffiliateWidget deals={deals} placement="inline" heading="Prefer not to take the bus?" />

      <p className="border-t border-line pt-6 text-sm text-muted">
        <Link href="/bus-routes" className="font-semibold text-teal-ink hover:underline">
          ← All Mazatlán bus routes
        </Link>
      </p>
    </>
  );
}

export default function BusRoutePage(props: Props) {
  return (
    <article className="space-y-10">
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-[14px] bg-navy/[0.04]" />}
      >
        <RouteDetail params={props.params} />
      </Suspense>
    </article>
  );
}
