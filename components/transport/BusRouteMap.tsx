"use client";

import dynamic from "next/dynamic";

import type { BusStop, RoutePath } from "@/types";

/**
 * Client boundary for the route map.
 *
 * `ssr: false` is only legal inside a Client Component, which is why this thin
 * wrapper exists: it keeps map libraries (which touch `window` on import) out of
 * the server render while letting Server Components import <BusRouteMap /> freely.
 */
const BusRouteMapClient = dynamic(() => import("./BusRouteMapClient"), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse rounded-xl bg-black/5 dark:bg-white/10" aria-hidden />
  ),
});

export function BusRouteMap({
  stops,
  path,
  className,
}: {
  stops: BusStop[];
  path: RoutePath;
  className?: string;
}) {
  return <BusRouteMapClient stops={stops} path={path} className={className} />;
}
