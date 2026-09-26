import type { ReactNode } from "react";

import { HeroVideo } from "@/components/home/HeroVideo";

/**
 * Full-bleed page hero, with an optional background clip.
 *
 * Renders outside .page-shell so it spans the viewport without 100vw tricks
 * (those add a horizontal scrollbar equal to the scrollbar's own width).
 *
 * The gradient underneath always paints, so the heading is legible from the
 * first frame whether or not the video ever loads.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  videoSrc,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  videoSrc?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_15%_0%,#1c3d4a_0%,#102a35_55%,#0b1e26_100%)]"
      />

      {videoSrc ? (
        <HeroVideo src={videoSrc} className="absolute inset-0 h-full w-full object-cover" />
      ) : null}

      {/* Tuned against a white frame: the copy holds 5.4:1 at the far edge of
          the text column while the footage stays visible. */}
      <div aria-hidden className="hero-scrim absolute inset-0" />

      <div className="relative mx-auto w-full max-w-5xl px-5 py-20 sm:px-6 sm:py-28 lg:py-32">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-coral">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.08] text-white sm:text-5xl md:text-[3.4rem]">
          {title}
        </h1>
        {intro ? (
          <div className="mt-5 max-w-lg text-lg leading-relaxed text-sand/90">{intro}</div>
        ) : null}
        {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  );
}
