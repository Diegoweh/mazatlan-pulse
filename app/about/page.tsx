import type { Metadata } from "next";
import Link from "next/link";

import { ContactEmail } from "@/components/ui/ContactEmail";
import { JsonLd } from "@/components/ui/JsonLd";
import { contact } from "@/lib/contact";
import { breadcrumbSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who writes ${siteConfig.name}, how bus routes and events are checked, and how the site is funded.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <article className="max-w-2xl space-y-10">
        <header>
          <p className="eyebrow">About</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-navy sm:text-5xl">
            A guide to Mazatlán, written by someone who rides the buses
          </h1>
        </header>

        <div className="prose-guide space-y-8">
          <section className="space-y-3">
            <p>
              {siteConfig.name} is written and maintained by {contact.name}, a web developer who
              lives in Mazatlán. It exists because the practical things a visitor needs — which bus to flag
              down, what it costs, how to get to the lighthouse — are scattered across Spanish-only
              Facebook groups and outdated forum threads. This site puts them in one place, in
              English.
            </p>
          </section>

          <section className="space-y-3">
            <h2>How the information is checked</h2>
            <p>
              Bus routes are entered by hand, not scraped. Each route page shows the date it was last
              verified in person, and says so plainly when it hasn&apos;t been.
            </p>
            <p>
              Events come from local venues&apos; public listings. The English summaries are drafted
              with the help of an AI model and every one is reviewed by a person before it is
              published. Each event links back to its original source.
            </p>
          </section>

          <section className="space-y-3">
            <h2>How the site is funded</h2>
            <p>
              Some links to tours, transfers and hotels are affiliate links: if you book through
              them, the site may earn a commission at no extra cost to you. Bus routes and event
              listings are never paid placements. The details are in the{" "}
              <Link href="/affiliate-disclosure" className="font-semibold text-teal-ink underline">
                affiliate disclosure
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2>Corrections and contact</h2>
            <p>
              Fares change and routes move. If something here is wrong, or you run a venue and want
              your events listed, get in touch.
            </p>
            <ContactEmail subject={`${siteConfig.name}: hello`} />
          </section>
        </div>
      </article>
    </div>
  );
}
