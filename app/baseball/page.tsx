import type { Metadata } from "next";

import { BaseballSchedule } from "@/components/baseball/BaseballSchedule";
import { Figure } from "@/components/ui/Figure";
import { JsonLd } from "@/components/ui/JsonLd";
import { PlaceMap } from "@/components/ui/PlaceMap";
import { ballparkGuide, SEASON_LABEL, STADIUM } from "@/content/baseball";
import { breadcrumbSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";

const title = `Venados de Mazatlán ${SEASON_LABEL} Schedule`;
const description = `Every Venados de Mazatlán game of the ${SEASON_LABEL} Mexican Pacific League season, home and away, in English — plus what to know about ${STADIUM}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/baseball" },
  openGraph: { title, description, url: "/baseball" },
};

export default function BaseballPage() {
  const guide = ballparkGuide.filter((section) => section.body.length > 0);

  return (
    <div className="page-shell space-y-14">
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Baseball", path: "/baseball" },
        ])}
      />

      <header className="grid gap-6 sm:grid-cols-5 sm:items-center">
        <div className="sm:col-span-3">
          <p className="eyebrow">Winter baseball · {SEASON_LABEL}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-navy sm:text-5xl">
            Venados de Mazatlán
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/75">
            Mazatlán&apos;s team plays in the Mexican Pacific League, the winter league that
            runs while baseball up north is off. Home games are at {STADIUM}.
          </p>
        </div>
        <Figure
          src="/images/teodoro-mariscal-aerial.jpg"
          alt="Aerial view of Estadio Teodoro Mariscal: a green diamond ringed by red seats under a white roof, with hotel towers and the Pacific behind it."
          imageClassName="aspect-[6/5]"
          sizes="(min-width: 640px) 400px, 100vw"
          caption={`${STADIUM} from above`}
          className="sm:col-span-2"
          priority
        />
      </header>

      <section aria-labelledby="schedule-heading" className="space-y-5">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2 id="schedule-heading" className="mt-1 font-display text-2xl text-navy sm:text-3xl">
            October to December
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            <span className="font-semibold text-coral-ink">Home</span> games are the ones you can
            catch in Mazatlán. Usual start times are{" "}
            <a href="#times" className="font-semibold text-teal-ink hover:underline">
              below the schedule
            </a>
            .
          </p>
        </div>
        <BaseballSchedule />
        <p className="text-xs leading-relaxed text-muted">
          Transcribed from the Venados de Mazatlán official {SEASON_LABEL} calendar. January
          dates and playoffs will be added when they&apos;re published. Mazatlán Pulse is not
          affiliated with the club or the league.
        </p>
      </section>

      <section aria-labelledby="stadium-heading" className="grid gap-6 sm:grid-cols-2 sm:items-center">
        <Figure
          src="/images/teodoro-mariscal-entrance.jpg"
          alt="The front of Estadio Teodoro Mariscal: a white tensile roof above a dark facade with the red Venados logo, palm trees along the sidewalk."
          imageClassName="aspect-[16/10]"
          sizes="(min-width: 640px) 500px, 100vw"
          caption="The main entrance"
        />
        <div>
          <p className="eyebrow">The ballpark</p>
          <h2 id="stadium-heading" className="mt-1 font-display text-2xl text-navy sm:text-3xl">
            {STADIUM}
          </h2>
          <p className="mt-3 leading-relaxed text-ink/75">
            Look for the red Venados sign out front.
          </p>
        </div>
      </section>

      {guide.map((section) => (
        <section key={section.id} id={section.id} className="max-w-prose space-y-3">
          <h2 className="font-display text-2xl text-navy">{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed text-ink/80">
              {paragraph}
            </p>
          ))}
          {section.rows ? (
            <dl className="divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
              {section.rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-ink">{row.label}</dt>
                  <dd className="shrink-0 font-semibold text-navy">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {section.place ? <PlaceMap {...section.place} /> : null}
        </section>
      ))}
    </div>
  );
}
