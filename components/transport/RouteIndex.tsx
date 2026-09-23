import Link from "next/link";

import { cn, formatMxn } from "@/lib/utils";
import type { BusRouteRow } from "@/types";

/**
 * Editorial index rather than a card grid.
 *
 * Routes are data, not imagery — a card wrapped around a name and a fare is
 * packaging with nothing to package. Rows scan like a timetable, which is what
 * someone comparing four routes is actually doing.
 */
export function RouteIndex({
  routes,
  className,
}: {
  routes: BusRouteRow[];
  className?: string;
}) {
  if (routes.length === 0) return null;

  return (
    <ol className={cn("border-t border-line", className)}>
      {routes.map((route, index) => (
        <li key={route.id} className="border-b border-line">
          <Link
            href={`/bus-routes/${route.slug}`}
            className="group flex items-baseline gap-4 py-5 transition-colors hover:bg-teal-wash/60 sm:gap-6 sm:px-3"
          >
            <span className="font-mono text-xs tabular-nums text-teal" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block font-display text-xl leading-tight text-navy transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
                {route.route_name}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {[
                  route.fare_mxn !== null ? formatMxn(route.fare_mxn) : null,
                  `${route.key_stops.length} key stops`,
                  route.operating_hours,
                ]
                  .filter(Boolean)
                  .join("  ·  ")}
              </span>
            </span>

            {route.last_verified_at === null ? (
              <span className="hidden shrink-0 text-xs font-semibold text-coral-ink sm:block">
                unverified
              </span>
            ) : null}

            <span
              aria-hidden
              className="shrink-0 text-lg text-teal transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
