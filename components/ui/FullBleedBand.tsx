import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Edge-to-edge photo band with a line of copy on it.
 *
 * Must render outside .page-shell — that's what lets it span the viewport
 * without the 100vw trick, which adds a horizontal scrollbar the width of the
 * scrollbar itself.
 *
 * Only for sources at least 1920px wide: at full viewport width on a retina
 * screen anything smaller visibly softens.
 */
export function FullBleedBand({
  src,
  alt,
  kicker,
  children,
  heightClassName = "h-[22rem] sm:h-[28rem]",
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  kicker: string;
  children: ReactNode;
  heightClassName?: string;
  objectPosition?: string;
}) {
  return (
    <section className={`relative isolate overflow-hidden ${heightClassName}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition }}
      />
      {/* Bottom-weighted: the copy sits low, so the sky stays untouched. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto w-full max-w-5xl px-5 pb-8 sm:px-6 sm:pb-10">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-coral">
            {kicker}
          </p>
          <p className="mt-2 max-w-xl font-display text-2xl leading-snug text-white sm:text-3xl">
            {children}
          </p>
        </div>
      </div>
    </section>
  );
}
