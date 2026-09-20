import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";
import { formatMxn } from "@/lib/utils";
import { getBusRoutes } from "@/services/transport/queries";

export const metadata: Metadata = {
  title: "Mazatlán Bus Routes Guide for Visitors",
  description:
    "How to ride the public buses in Mazatlán: routes, fares, key stops between the Golden Zone, Centro and Cerritos, and what to expect on board.",
  alternates: { canonical: "/bus-routes" },
  openGraph: {
    title: "Mazatlán Bus Routes Guide for Visitors",
    description:
      "How to ride the public buses in Mazatlán: routes, fares, key stops and what to expect on board.",
    url: "/bus-routes",
  },
};

export default async function BusRoutesPage() {
  const routes = await getBusRoutes();

  return (
    <div className="space-y-10">
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Bus routes", path: "/bus-routes" },
        ])}
      />

      <header className="max-w-2xl">
        <p className="eyebrow">Getting around</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-navy sm:text-5xl">
          Mazatlán bus routes
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/75">
          Checked by hand, not scraped. Flag the bus down at any corner, pay the driver when you
          board, and keep small bills handy.
        </p>
      </header>

      {routes.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2">
          {routes.map((route) => (
            <li key={route.id}>
              <Link
                href={`/bus-routes/${route.slug}`}
                className="card card-interactive flex h-full flex-col gap-3 p-6"
              >
                <span className="font-display text-xl text-navy">{route.route_name}</span>

                <span className="flex flex-wrap items-center gap-2">
                  <span className="pill bg-teal-wash text-teal-ink">
                    {route.key_stops.length} key stops
                  </span>
                  {route.fare_mxn !== null ? (
                    <span className="pill bg-coral-wash text-coral-ink">
                      {formatMxn(route.fare_mxn)}
                    </span>
                  ) : null}
                </span>

                {route.operating_hours ? (
                  <span className="text-sm text-muted">{route.operating_hours}</span>
                ) : null}

                {route.last_verified_at === null ? (
                  <span className="mt-auto pt-2 text-xs font-semibold text-coral-ink">
                    Not yet verified on the ground
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">
          Route guides are on the way. Each one is checked in person before it goes up.
        </p>
      )}
    </div>
  );
}
