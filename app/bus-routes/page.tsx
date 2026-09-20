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
    <div className="space-y-8">
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Bus routes", path: "/bus-routes" },
        ])}
      />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mazatlán bus routes</h1>
        <p className="max-w-2xl text-black/70 dark:text-white/70">
          Hand-checked routes, not scraped. Flag the bus down at any corner, pay the driver when you
          board, and keep small bills handy.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {routes.map((route) => (
          <li key={route.id}>
            <Link
              href={`/bus-routes/${route.slug}`}
              className="block h-full rounded-xl border border-black/10 p-4 hover:shadow-md dark:border-white/15"
            >
              <p className="font-semibold">{route.route_name}</p>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {route.key_stops.length} key stops
                {route.fare_mxn !== null ? ` · ${formatMxn(route.fare_mxn)}` : ""}
              </p>
              {route.last_verified_at === null ? (
                <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                  Not yet verified on the ground
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      {routes.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          No routes published yet. Seed them with <code>supabase/seed.sql</code> and verify each one.
        </p>
      ) : null}
    </div>
  );
}
