import type { Metadata } from "next";
import Link from "next/link";

import { ContactEmail } from "@/components/ui/ContactEmail";
import { JsonLd } from "@/components/ui/JsonLd";
import { contact } from "@/lib/contact";
import { breadcrumbSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `What ${siteConfig.name} collects (very little), which services your browser talks to, and how to reach us.`,
  alternates: { canonical: "/privacy" },
};

/**
 * Written against what the site actually does, verified in the code and in live
 * response headers — not a template. If you add analytics, a newsletter, a
 * contact form or ads, this page has to change in the same commit.
 */
const EFFECTIVE = "October 16, 2026";

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Privacy policy", path: "/privacy" },
        ])}
      />

      <article className="max-w-2xl space-y-10">
        <header>
          <p className="eyebrow">Privacy</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-navy sm:text-5xl">
            Privacy policy
          </h1>
          <p className="mt-3 text-sm text-muted">Effective {EFFECTIVE}</p>
        </header>

        <div className="prose-guide space-y-8">
          <section className="space-y-3">
            <h2>The short version</h2>
            <p>
              {siteConfig.name} does not use analytics, advertising trackers or tracking cookies.
              Reading the site does not require an account, and we do not ask for your name or email.
              We do not sell or share personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Cookies</h2>
            <p>
              The public pages of this site set no cookies. The only cookies it uses are login
              cookies for the site&apos;s own editors, on the private admin pages.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Affiliate links</h2>
            <p>
              Some links to tours, transfers, hotels and car rentals are affiliate links. When you
              click one, you leave this site, and the partner you land on may set its own cookies to
              record that you came from here. Those cookies are governed by that partner&apos;s
              privacy policy, not this one.
            </p>
            <p>
              On our side, a click on an affiliate link adds one to a counter for that offer. It
              records which offer was clicked — nothing about who clicked it.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Services your browser talks to</h2>
            <p>
              Like any website, pages are delivered by a hosting provider, Vercel, which processes
              standard request information such as IP address and browser type in order to serve
              the site and keep it secure. The site&apos;s content is stored with Supabase.
            </p>
            <p>
              Bus route pages and the baseball page show an interactive map. The map tiles are loaded by your browser
              directly from OpenFreeMap, which receives standard request information when it sends
              them. Fonts are hosted on this site, so loading a page does not contact Google.
            </p>
          </section>

          <section className="space-y-3">
            <h2>If you email us</h2>
            <p>
              If you write to us, we use your address only to reply and do not add it to any list.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Your rights</h2>
            <p>
              Depending on where you live — for example under the GDPR in Europe or the CCPA in
              California — you may have the right to ask what personal information we hold about
              you, to have it corrected or deleted, and to object to its use. Given how little this
              site collects, the answer will usually be that we hold nothing, but you can ask.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Children</h2>
            <p>
              The site is not directed at children and does not knowingly collect information from
              them.
            </p>
          </section>

          <section className="space-y-3">
            <h2>Changes and contact</h2>
            <p>
              If the site starts collecting anything new, this page will be updated first and the
              date above will change. Questions go to {contact.name}. See also the{" "}
              <Link href="/affiliate-disclosure" className="font-semibold text-teal-ink underline">
                affiliate disclosure
              </Link>
              .
            </p>
            <ContactEmail subject={`${siteConfig.name}: privacy`} />
          </section>
        </div>
      </article>
    </div>
  );
}
