import type { Metadata } from "next";

import { EventCard } from "@/components/events/EventCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";
import { getUpcomingEvents } from "@/services/events/queries";

export const metadata: Metadata = {
  title: "Events in Mazatlán This Week",
  description:
    "Upcoming concerts, festivals, nightlife and community events in Mazatlán, in English. Every listing is reviewed by a human before it appears.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Events in Mazatlán This Week",
    description:
      "Upcoming concerts, festivals, nightlife and community events in Mazatlán, in English.",
    url: "/events",
  },
};

export default async function EventsPage() {
  const events = await getUpcomingEvents({ limit: 60 });

  return (
    <div className="page-shell space-y-10">
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Events", path: "/events" },
        ])}
      />

      <header className="max-w-2xl">
        <p className="eyebrow">What&apos;s on</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-navy sm:text-5xl">
          Events in Mazatlán
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/75">
          Concerts, festivals and nightlife, in English. All times are Mazatlán local time.
        </p>
      </header>

      {events.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} priority={index < 3} />
          ))}
        </div>
      ) : (
        <p className="text-muted">
          No events listed right now. We check local listings regularly — check back soon.
        </p>
      )}
    </div>
  );
}
