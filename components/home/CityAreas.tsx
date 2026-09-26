import Link from "next/link";

import { Figure } from "@/components/ui/Figure";

/**
 * Orientation triptych: the three parts of Mazatlán a visitor needs to tell
 * apart before any route name means anything.
 *
 * Portrait crops and per-area copy, so this earns its place as content rather
 * than sitting there as a photo grid.
 *
 * Copy is short on purpose and safe to edit — nothing here claims a fact that
 * isn't visible in the photo or supported by the routes already published.
 */
const AREAS = [
  {
    src: "/images/mzt-1.webp",
    alt: "Aerial view of Mazatlán's Golden Zone at dusk, hotel towers along a curving beach with the city lights coming on.",
    name: "Zona Dorada",
    blurb:
      "The hotel strip along the beach. Most visitors sleep here, and most bus routes run through it.",
  },
  {
    src: "/images/mzt-5.webp",
    alt: "Golden hour over the rooftops of Mazatlán's historic centre, with cathedral towers and an antenna-topped hill behind.",
    name: "Centro Histórico",
    blurb:
      "The old city: the basilica, the market, the plazas. The far end of the Sábalo–Centro route.",
  },
  {
    src: "/images/mzt-3.webp",
    alt: "Cerro del Crestón at dusk, the steep headland that closes the southern entrance to Mazatlán's harbour, with the lighthouse on its summit and waves breaking in the foreground.",
    name: "Cerro del Crestón",
    blurb:
      "The headland at the south end, with the lighthouse on top. The climb is what most visitors come down here for.",
  },
] as const;

export function CityAreas() {
  return (
    <section aria-labelledby="areas-heading" className="space-y-6">
      <div className="max-w-2xl">
        <p className="eyebrow">Getting oriented</p>
        <h2 id="areas-heading" className="mt-1 font-display text-2xl text-navy sm:text-3xl">
          One city, three places you&apos;ll actually go
        </h2>
        <p className="mt-3 leading-relaxed text-ink/75">
          Route names are mostly pairs of places like these. Learn the shape of the city and the
          timetable starts reading like a map.
        </p>
      </div>

      {/*
        Below sm this is a snap carousel, above it the original three-up grid.
        CSS scroll-snap rather than a carousel library: no JS, no hydration, and
        it still works as a plain scroll container if anything fails.

        -mx-5/px-5 cancels .page-shell's gutter so cards can run to the screen
        edge while the first one stays aligned with the text above it. The next
        card peeking past the edge is the affordance that says "scrollable".

        tabIndex makes the region reachable by keyboard: a scrollable box whose
        children hold no focusable elements is otherwise unreachable without a
        pointer. It applies on narrow desktop windows too, where it also scrolls.
      */}
      <div
        tabIndex={0}
        role="group"
        aria-label="Three areas of Mazatlán"
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {AREAS.map((area) => (
          <div
            key={area.name}
            className="w-[78%] shrink-0 snap-start space-y-3 sm:w-auto sm:shrink"
          >
            <Figure
              src={area.src}
              alt={area.alt}
              // Landscape on phones, portrait on the grid: a 3:4 crop at full
              // phone width is taller than the screen.
              imageClassName="aspect-[4/3] sm:aspect-[3/4]"
              sizes="(min-width: 640px) 32vw, 78vw"
            />
            <div>
              <h3 className="font-display text-lg text-navy">{area.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{area.blurb}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm">
        <Link href="/bus-routes" className="font-semibold text-teal-ink hover:underline">
          See how the buses connect them →
        </Link>
      </p>
    </section>
  );
}
