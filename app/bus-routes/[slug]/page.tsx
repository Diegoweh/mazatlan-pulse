import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TourAffiliateWidget } from "@/components/tours/TourAffiliateWidget";
import { BusRouteMap } from "@/components/transport/BusRouteMap";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, busRouteSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";
import { formatMxn, truncateForMeta } from "@/lib/utils";
import { getAffiliateDeals } from "@/services/affiliates/queries";
import { getBusRouteBySlug } from "@/services/transport/queries";

type Props = { params: Promise<{ slug: string }> };

// Same as /events/[slug]: re-add generateStaticParams (mapping getBusRoutes() to
// { slug }) once routes exist at build time. Cache Components rejects one that
// returns an empty array.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = await getBusRouteBySlug(slug);
  if (!route) return { title: "Route not found" };

  const title = `${route.route_name} Bus Route`;
  const description =
    truncateForMeta(route.tourist_tips_en) ??
    `Stops, fare and rider tips for the ${route.route_name} bus in Mazatlán.`;

  return {
    title,
    description,
    alternates: { canonical: `/bus-routes/${route.slug}` },
    // Without this the page inherits the root layout's OG tags, so every route
    // would share one title and point og:url at the homepage.
    openGraph: {
      type: "article",
      title,
      description,
      url: `/bus-routes/${route.slug}`,
    },
  };
}

async function RouteDetail({ params }: Props) {
  const { slug } = await params;
  const route = await getBusRouteBySlug(slug);
  if (!route) notFound();

  const deals = await getAffiliateDeals({ category: "airport_transfer", limit: 2 });

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

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{route.route_name}</h1>
        <p className="text-black/70 dark:text-white/70">
          {route.fare_mxn !== null ? `Fare ${formatMxn(route.fare_mxn)}` : "Fare not verified"}
          {route.operating_hours ? ` · ${route.operating_hours}` : ""}
        </p>
        {route.last_verified_at ? (
          <p className="text-xs text-black/50 dark:text-white/50">
            Last verified {new Date(route.last_verified_at).toLocaleDateString("en-US")}
          </p>
        ) : (
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Not yet verified on the ground — treat stops and fares as provisional.
          </p>
        )}
      </header>

      {route.tourist_tips_en ? (
        <p className="max-w-2xl leading-relaxed">{route.tourist_tips_en}</p>
      ) : null}

      <BusRouteMap stops={route.key_stops} path={route.route_path} />

      {route.fare_notes ? (
        <p className="text-sm text-black/60 dark:text-white/60">{route.fare_notes}</p>
      ) : null}

      <TourAffiliateWidget deals={deals} placement="inline" heading="Prefer not to take the bus?" />
    </>
  );
}

export default function BusRoutePage(props: Props) {
  return (
    <article className="space-y-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-black/5" />}>
        <RouteDetail params={props.params} />
      </Suspense>
    </article>
  );
}
