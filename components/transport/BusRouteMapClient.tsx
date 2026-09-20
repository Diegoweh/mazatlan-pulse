"use client";

import { cn } from "@/lib/utils";
import type { BusStop, RoutePath } from "@/types";

/**
 * Placeholder renderer for the route map.
 *
 * Swap the body for Leaflet/MapLibre — this file is already the client-only,
 * dynamically-imported boundary, so a map library that touches `window` at import
 * time won't break SSR. Keep the props shape when you do.
 */
export default function BusRouteMapClient({
  stops,
  path,
  className,
}: {
  stops: BusStop[];
  path: RoutePath;
  className?: string;
}) {
  const ordered = [...stops].sort((a, b) => a.order - b.order);

  return (
    <div
      className={cn(
        "rounded-xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/15 dark:bg-white/5",
        className,
      )}
    >
      <p className="mb-3 text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
        Route map ({path.length} plotted points)
      </p>
      <ol className="space-y-2">
        {ordered.map((stop) => (
          <li key={`${stop.order}-${stop.name}`} className="flex gap-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[11px] font-semibold text-white">
              {stop.order}
            </span>
            <span>
              {stop.name}
              <span className="ml-2 text-xs text-black/40 dark:text-white/40">
                {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
