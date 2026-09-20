"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { trackAffiliateClick } from "@/services/affiliates/track-click";
import type { AffiliateDealRow, AffiliatePlacement } from "@/types";

const PLACEMENT_STYLES: Record<AffiliatePlacement, string> = {
  sidebar: "flex flex-col gap-3",
  inline: "grid gap-3 sm:grid-cols-2",
  footer: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
  grid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
};

/**
 * One widget, four placements. Client component because of the click handler —
 * keep it a leaf so the pages that embed it stay server-rendered and cacheable.
 *
 * Disclosure is rendered unconditionally: these are paid links, and FTC guidance
 * (plus Google's affiliate policy) expects it near the links themselves.
 */
export function TourAffiliateWidget({
  deals,
  placement = "grid",
  heading = "Book ahead",
  className,
}: {
  deals: AffiliateDealRow[];
  placement?: AffiliatePlacement;
  heading?: string;
  className?: string;
}) {
  if (deals.length === 0) return null;

  return (
    <section className={cn("w-full", className)} aria-label={heading}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold">{heading}</h2>
        <p className="text-xs text-black/50 dark:text-white/50">
          Affiliate links — we may earn a commission at no extra cost to you.
        </p>
      </div>

      <div className={PLACEMENT_STYLES[placement]}>
        {deals.map((deal) => (
          <a
            key={deal.id}
            id={deal.slug}
            href={deal.affiliate_url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => trackAffiliateClick(deal.slug)}
            className="flex gap-3 rounded-xl border border-black/10 bg-white p-3 transition hover:shadow-md dark:border-white/15 dark:bg-white/5"
          >
            {deal.image_url ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/5">
                <Image src={deal.image_url} alt="" fill sizes="80px" className="object-cover" />
              </div>
            ) : null}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{deal.title}</p>
              {deal.location_name ? (
                <p className="truncate text-xs text-black/50 dark:text-white/50">
                  {deal.location_name}
                </p>
              ) : null}
              {deal.short_description_en ? (
                <p className="mt-1 line-clamp-2 text-xs text-black/60 dark:text-white/60">
                  {deal.short_description_en}
                </p>
              ) : null}
              {deal.price_from_usd !== null ? (
                <p className="mt-1 text-xs font-medium">From ${deal.price_from_usd} USD</p>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
