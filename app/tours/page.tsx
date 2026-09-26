import type { Metadata } from "next";
import Link from "next/link";

import { TourAffiliateWidget } from "@/components/tours/TourAffiliateWidget";
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
