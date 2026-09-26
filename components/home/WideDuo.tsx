import Image from "next/image";

/**
 * Full-bleed pair, deliberately unlike the contained triptych above it: edge to
 * edge, no captions, text sitting on the image instead of under it.
 *
 * Lives outside .page-shell, which is what lets it span the viewport without
 * the 100vw trick that adds a horizontal scrollbar.
 */
const PANELS = [
  {
    src: "/images/mzt-4.webp",
    alt: "The Mazatlán malecón in the afternoon, with the giant MAZATLÁN letters, palm trees and a white Moorish-style building above the seafront road.",
    kicker: "The malecón",
    line: "The seafront road the city is built along, and the spine every bus route follows.",
  },
  {
    src: "/images/mzt-2.webp",
    alt: "Orange sunset over the Pacific from a Mazatlán beach, with island silhouettes on the horizon and waves washing the sand.",
    kicker: "Sunset, most nights",
    line: "The islands sit exactly where the sun goes down. Nobody has to tell you to stop and watch.",
  },
] as const;

export function WideDuo() {
  return (
    <section aria-label="Mazatlán at street level" className="grid gap-px bg-line sm:grid-cols-2">
      {PANELS.map((panel) => (
        <div key={panel.src} className="relative isolate h-[22rem] overflow-hidden sm:h-[26rem]">
          <Image
            src={panel.src}
            alt={panel.alt}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          {/* Bottom-weighted scrim: the copy sits low, so the top of the frame
              stays untouched. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-coral">
              {panel.kicker}
            </p>
            <p className="mt-2 max-w-sm font-display text-xl leading-snug text-white sm:text-2xl">
              {panel.line}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
