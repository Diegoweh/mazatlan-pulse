import type { Metadata } from "next";
import Link from "next/link";

import { TourAffiliateWidget } from "@/components/tours/TourAffiliateWidget";
import { Figure } from "@/components/ui/Figure";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { breadcrumbSchema, touristAttractionSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";
import { getAffiliateDeals } from "@/services/affiliates/queries";

export const metadata: Metadata = {
  title: "Best Tours & Day Trips in Mazatlán",
  description:
    "Hand-picked Mazatlán tours, day trips and airport transfers, with English-speaking operators and free cancellation where offered.",
  alternates: { canonical: "/tours" },
  openGraph: {
    title: "Best Tours & Day Trips in Mazatlán",
    description:
      "Hand-picked Mazatlán tours, day trips and airport transfers with English-speaking operators.",
    url: "/tours",
  },
};

export default async function ToursPage() {
  const deals = await getAffiliateDeals({ limit: 30 });
  const tours = deals.filter((deal) => deal.category === "tour" || deal.category === "activity");
  const transport = deals.filter(
    (deal) => deal.category === "airport_transfer" || deal.category === "car_rental",
  );

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Tours", path: "/tours" },
        ])}
      />
      {tours.map((deal) => (
        <JsonLd key={deal.id} schema={touristAttractionSchema(deal)} />
      ))}

      {/* Punta Camarón, where most visitors' idea of Mazatlán starts. */}
      <PageHero
        eyebrow="Worth booking"
        title="Tours & day trips"
        intro="A short, hand-picked list rather than an endless catalogue. Bookings go through partner sites; we earn a commission at no extra cost to you."
        videoSrc="/video/punta-camaron.mp4"
      />

      <div className="page-shell space-y-12">
        <section className="grid gap-6 sm:grid-cols-5 sm:items-center">
          <Figure
            src="/images/tour-banana-boat.jpg"
            alt="A family in life jackets holding on to a yellow inflatable banana boat as it is towed fast across the water off Mazatlán."
            imageClassName="aspect-[6/5]"
            sizes="(min-width: 640px) 400px, 100vw"
            caption="Banana boat off the Golden Zone"
            className="sm:col-span-2"
          />
          <div className="space-y-3 sm:col-span-3">
            <h2 className="font-display text-2xl text-navy">What people actually book</h2>
            <p className="leading-relaxed text-ink/80">
              Water sports off the Golden Zone, boat trips to Deer Island, food walks through
              Centro and day trips inland. We list the operators we would send a friend to, not
              every listing that pays a commission.
            </p>
          </div>
        </section>

        {/* The activities the affiliate links will point at. Same height so they
            read as a set, not a gallery. */}
        <section aria-label="Popular activities" className="grid gap-4 sm:grid-cols-3">
          <Figure
            src="/images/tour-whale-watching.jpg"
            alt="A humpback whale's tail lifting out of the water beside a small boat of visitors in life jackets off Mazatlán."
            imageClassName="aspect-[4/3]"
            sizes="(min-width: 640px) 330px, 100vw"
            caption="Whale watching"
          />
          <Figure
            src="/images/tour-turtle-release.jpg"
            alt="Newly hatched sea turtles crawling across the sand toward the sea."
            imageClassName="aspect-[4/3]"
            sizes="(min-width: 640px) 330px, 100vw"
            caption="Turtle hatchling releases"
          />
          <Figure
            src="/images/tour-zipline.jpg"
            alt="A woman in a helmet and harness on a zipline high above dense green forest."
            imageClassName="aspect-[4/3]"
            sizes="(min-width: 640px) 330px, 100vw"
            caption="Ziplining inland"
          />
        </section>

      <TourAffiliateWidget deals={tours} placement="grid" heading="Tours & activities" />
      <TourAffiliateWidget deals={transport} placement="grid" heading="Airport transfers & cars" />

      {deals.length === 0 ? (
        <div className="card max-w-xl p-6">
          <p className="leading-relaxed text-ink/80">
            We&apos;re still hand-picking the tours worth recommending. In the meantime, the{" "}
            <Link href="/bus-routes" className="font-semibold text-teal-ink hover:underline">
              bus route guides
            </Link>{" "}
            cover getting around on your own.
          </p>
        </div>
        ) : null}
      </div>
    </>
  );
}
