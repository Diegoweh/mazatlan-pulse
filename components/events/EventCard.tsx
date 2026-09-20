import Image from "next/image";
import Link from "next/link";

import { cn, formatEventDate } from "@/lib/utils";
import type { PublicEvent } from "@/types";

const CATEGORY_LABELS: Record<PublicEvent["category"], string> = {
  music: "Live music",
  nightlife: "Nightlife",
  festival: "Festival",
  sports: "Sports",
  food_drink: "Food & drink",
  arts_culture: "Arts & culture",
  family: "Family",
  community: "Community",
  other: "Event",
};

export function EventCard({
  event,
  className,
  priority = false,
}: {
  event: PublicEvent;
  className?: string;
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition hover:shadow-lg dark:border-white/15 dark:bg-white/5",
        className,
      )}
    >
      {event.image_url ? (
        <div className="relative aspect-[16/9] w-full bg-black/5">
          <Image
            src={event.image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority={priority}
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-700 dark:text-teal-300">
          {CATEGORY_LABELS[event.category]}
        </p>

        <h3 className="text-lg font-semibold leading-snug">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">
            {event.title}
          </Link>
        </h3>

        <p className="text-sm text-black/70 dark:text-white/70">
          <time dateTime={event.starts_at}>{formatEventDate(event.starts_at)}</time>
          {event.venue_name ? ` · ${event.venue_name}` : null}
        </p>

        {event.description_en ? (
          <p className="line-clamp-3 text-sm text-black/60 dark:text-white/60">
            {event.description_en}
          </p>
        ) : null}

        {event.price_info ? (
          <p className="mt-auto pt-2 text-sm font-medium">{event.price_info}</p>
        ) : null}
      </div>
    </article>
  );
}
