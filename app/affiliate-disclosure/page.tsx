import type { Metadata } from "next";
import Link from "next/link";

import { ContactEmail } from "@/components/ui/ContactEmail";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  description: `How ${siteConfig.name} earns money, and what that does and doesn't influence.`,
  alternates: { canonical: "/affiliate-disclosure" },
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="page-shell">
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Affiliate disclosure", path: "/affiliate-disclosure" },
        ])}
      />

      <article className="max-w-2xl space-y-10">
        <header>
          <p className="eyebrow">Disclosure</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-navy sm:text-5xl">
            How this site makes money
          </h1>
        </header>

        <div className="prose-guide space-y-8">
          <section className="space-y-3">
            <p>
              {siteConfig.name} is free to read. It is paid for by affiliate links: when you book
              certain tours, airport transfers, hotels or car rentals through a link on this site,
              the booking platform may pay us a commission.
            </p>
          </section>

          <section className="space-y-3">
            <h2>What it costs you</h2>
            <p>
              Nothing. The commission comes out of the platform&apos;s margin. You pay the same price
              you would by going to the platform directly.
            </p>
          </section>

          <section className="space-y-3">
            <h2>How to tell which links are affiliate links</h2>
            <p>
              Affiliate offers appear in clearly labelled blocks that say so directly beside them —
              mostly on the{" "}
              <Link href="/tours" className="font-semibold text-teal-ink underline">
                tours page
              </Link>{" "}
              and in short &ldquo;book ahead&rdquo; boxes on other pages. They are also marked as
              sponsored in the page code, which is how search engines are told.
            </p>
          </section>

          <section className="space-y-3">
            <h2>What it doesn&apos;t influence</h2>
            <p>
              Bus routes, fares and event listings are never paid placements, and nobody can pay to
              be included in them or to change what they say. We only recommend tours and services
              we would send a friend to, and a higher commission is not a reason to list something.
            </p>
            <p>
              We don&apos;t accept payment for reviews or for favourable coverage.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Questions</h2>
            <p>If you think something here isn&apos;t living up to this, say so.</p>
            <ContactEmail subject={`${siteConfig.name}: affiliate disclosure`} />
          </section>
        </div>
      </article>
    </div>
  );
}
