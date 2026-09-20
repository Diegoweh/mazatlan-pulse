import type { Metadata } from "next";

import { TourAffiliateWidget } from "@/components/tours/TourAffiliateWidget";
import { JsonLd } from "@/components/ui/JsonLd";
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
    <div className="space-y-10">
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Tours", path: "/tours" },
        ])}
      />
      {tours.map((deal) => (
        <JsonLd key={deal.id} schema={touristAttractionSchema(deal)} />
      ))}

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tours &amp; day trips in Mazatlán</h1>
        <p className="max-w-2xl text-black/70 dark:text-white/70">
          A short, hand-picked list rather than an endless catalogue. Bookings go through partner
          sites; we earn a commission at no extra cost to you.
        </p>
      </header>

      <TourAffiliateWidget deals={tours} placement="grid" heading="Tours & activities" />
      <TourAffiliateWidget deals={transport} placement="grid" heading="Airport transfers & cars" />

      {deals.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          No active deals yet. Add rows to <code>affiliate_deals</code> and flip{" "}
          <code>is_active</code>.
        </p>
      ) : null}
    </div>
  );
}
