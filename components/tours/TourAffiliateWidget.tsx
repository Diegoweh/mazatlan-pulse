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
 * Disclosure renders unconditionally: these are paid links, and FTC guidance
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
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-display text-xl text-navy">{heading}</h2>
        <p className="text-xs text-muted">
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
            className="card card-interactive group flex gap-4 p-4"
          >
            {deal.image_url ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-teal-wash">
                <Image src={deal.image_url} alt="" fill sizes="80px" className="object-cover" />
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-navy group-hover:text-teal-ink">
                {deal.title}
              </p>
              {deal.location_name ? (
                <p className="truncate text-xs text-muted">{deal.location_name}</p>
              ) : null}
              {deal.short_description_en ? (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/70">
                  {deal.short_description_en}
                </p>
              ) : null}
              {deal.price_from_usd !== null ? (
                <p className="mt-2 text-xs font-semibold text-coral-ink">
                  From ${deal.price_from_usd} USD
                </p>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
