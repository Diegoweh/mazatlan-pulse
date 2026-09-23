import { cn } from "@/lib/utils";
import type { BusStop } from "@/types";

/**
 * Server-rendered stop list.
 *
 * Deliberately NOT part of the map component: the map is loaded with
 * `ssr: false`, so anything inside it is absent from the HTML crawlers and
 * no-JS visitors receive. The stops are the actual content of the page, so
 * they render on the server and the map is the enhancement on top.
 */
export function BusRouteStops({ stops, className }: { stops: BusStop[]; className?: string }) {
  const ordered = [...stops].sort((a, b) => a.order - b.order);
  if (ordered.length === 0) return null;

  return (
    <section className={cn("card p-6", className)} aria-label="Key stops in travel order">
      <p className="eyebrow">Key stops in travel order</p>
      <p className="mb-5 mt-2 text-sm text-muted">
        This route runs as a loop — board at whichever of these is nearest to you.
      </p>
      <ol className="relative">
        <span aria-hidden className="absolute left-[11px] top-2 bottom-2 w-px bg-teal/45" />
        {ordered.map((stop) => (
          <li key={`${stop.order}-${stop.name}`} className="relative flex gap-4 pb-6 last:pb-0">
            <span
              aria-hidden
              className="relative z-10 mt-1 h-[22px] w-[22px] shrink-0 rounded-full border-2 border-surface bg-teal"
            />
            <span className="min-w-0 pt-0.5">
              <span className="block font-semibold text-navy">{stop.name}</span>
              <span className="block font-mono text-xs text-muted">
                {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
              </span>
            </span>
          </li>
        ))}
        {/* Closes the circuit visually, so "loop" isn't only a word in the caption. */}
        <li className="relative flex gap-4 pt-1">
          <span aria-hidden className="absolute left-[11px] -top-5 h-5 w-px border-l border-dashed border-teal/50" />
          <span
            aria-hidden
            className="relative z-10 mt-1 h-[22px] w-[22px] shrink-0 rounded-full border-2 border-dashed border-teal/60 bg-surface"
          />
          <span className="pt-0.5 text-sm text-muted">
            continues back around to {ordered[0].name}
          </span>
        </li>
      </ol>
    </section>
  );
}
