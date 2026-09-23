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
    <div className="h-[380px] animate-pulse rounded-[14px] bg-navy/[0.04]" aria-hidden />
  ),
});

export function BusRouteMap({
  stops,
  path,
  routeName,
  className,
}: {
  stops: BusStop[];
  path: RoutePath;
  routeName?: string;
  className?: string;
}) {
  return (
    <BusRouteMapClient stops={stops} path={path} routeName={routeName} className={className} />
  );
}
