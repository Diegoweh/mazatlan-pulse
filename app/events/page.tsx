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
    <div className="space-y-8">
      <JsonLd
        schema={breadcrumbSchema([
          { name: siteConfig.name, path: "/" },
          { name: "Events", path: "/events" },
        ])}
      />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Events in Mazatlán</h1>
        <p className="text-black/70 dark:text-white/70">
          Concerts, festivals and nightlife, in English. Times are Mazatlán local time.
        </p>
      </header>

      {events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} priority={index < 3} />
          ))}
        </div>
      ) : (
        <p className="text-black/60 dark:text-white/60">Nothing published yet — check back soon.</p>
      )}
    </div>
  );
}
