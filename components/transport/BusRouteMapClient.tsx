"use client";

import { cn } from "@/lib/utils";
import type { BusStop, RoutePath } from "@/types";

/**
 * Placeholder renderer for the route map, drawn as a stop timeline.
 *
 * Swap the body for Leaflet/MapLibre — this file is already the client-only,
 * dynamically-imported boundary, so a map library that touches `window` at
 * import time won't break SSR. Keep the props shape when you do.
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
  if (ordered.length === 0) return null;

  return (
    <section className={cn("card p-6", className)} aria-label="Key stops">
      <p className="eyebrow mb-5">
        Key stops{path.length > 0 ? ` · ${path.length} plotted points` : ""}
      </p>

      <ol className="relative">
        {/* The line the dots sit on. */}
        <span
          aria-hidden
          className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-teal via-teal/45 to-coral"
        />
        {ordered.map((stop, index) => (
          <li key={`${stop.order}-${stop.name}`} className="relative flex gap-4 pb-6 last:pb-0">
            <span
              aria-hidden
              className={cn(
                "relative z-10 mt-1 h-[22px] w-[22px] shrink-0 rounded-full border-2 border-surface",
                index === ordered.length - 1 ? "bg-coral" : "bg-teal",
              )}
            />
            <span className="min-w-0 pt-0.5">
              <span className="block font-semibold text-navy">{stop.name}</span>
              <span className="block font-mono text-xs text-muted">
                {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
