import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TourAffiliateWidget } from "@/components/tours/TourAffiliateWidget";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, eventSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";
import { formatEventDate, truncateForMeta } from "@/lib/utils";
import { getAffiliateDeals } from "@/services/affiliates/queries";
import { getEventBySlug } from "@/services/events/queries";

type Props = { params: Promise<{ slug: string }> };

// No generateStaticParams yet: with Cache Components it must return at least one
// entry, and there are no published events (or no Supabase env) at build time.
// Once the table has content, add it back to prerender the known slugs:
//
//   export async function generateStaticParams() {
//     const events = await getPublishedEventIndex();
//     return events.map((event) => ({ slug: event.slug }));
//   }
//
// Until then every slug is served as an App Shell and upgraded by ISR on first visit.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Cached by `use cache` in the query layer, so this doesn't double-fetch.
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };

  return {
    title: event.title,
    description: truncateForMeta(event.description_en),
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      type: "article",
      title: event.title,
      description: event.description_en ?? undefined,
      url: `/events/${event.slug}`,
      images: event.image_url ? [event.image_url] : undefined,
    },
  };
}

async function EventDetail({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const deals = await getAffiliateDeals({ limit: 3 });

  return (
    <>
      <JsonLd schema={eventSchema(event)} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Events", path: "/events" },
          { name: event.title, path: `/events/${event.slug}` },
        ])}
      />

      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        <p className="text-black/70 dark:text-white/70">
          <time dateTime={event.starts_at}>{formatEventDate(event.starts_at)}</time>
          {event.venue_name ? ` · ${event.venue_name}` : null}
        </p>
        {event.price_info ? <p className="font-medium">{event.price_info}</p> : null}
      </header>

      {event.image_url ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/5">
          <Image
            src={event.image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {event.description_en ? (
        <p className="max-w-2xl whitespace-pre-line leading-relaxed">{event.description_en}</p>
      ) : null}

      {event.address ? (
        <p className="text-sm text-black/60 dark:text-white/60">{event.address}</p>
      ) : null}

      {event.ticket_url ? (
        <a
          href={event.ticket_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
        >
          Tickets &amp; details
        </a>
      ) : null}

      {/* Attribution is not optional: we publish a summary, the listing is theirs. */}
      <p className="border-t border-black/10 pt-4 text-sm text-black/50 dark:border-white/15 dark:text-white/50">
        Summarized in English from{" "}
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline"
        >
          {event.source_name}
        </a>
        . Details can change — confirm with the venue before you go.
      </p>

      <TourAffiliateWidget deals={deals} placement="inline" heading="While you're in town" />
    </>
  );
}

/**
 * Not async, and never awaits params itself — that is what lets Next.js prerender
 * a URL-independent App Shell for slugs that weren't known at build time.
 */
export default function EventPage(props: Props) {
  return (
    <article className="space-y-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-black/5" />}>
        <EventDetail params={props.params} />
      </Suspense>
    </article>
  );
}
