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
    <article className={cn("card card-interactive group relative flex flex-col overflow-hidden", className)}>
      {event.image_url ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-teal-wash">
          <Image
            src={event.image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            priority={priority}
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="eyebrow">{CATEGORY_LABELS[event.category]}</p>

        <h3 className="font-display text-lg leading-snug text-navy">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">
            {event.title}
          </Link>
        </h3>

        <p className="text-sm text-muted">
          <time dateTime={event.starts_at}>{formatEventDate(event.starts_at)}</time>
          {event.venue_name ? ` · ${event.venue_name}` : null}
        </p>

        {event.description_en ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-ink/75">{event.description_en}</p>
        ) : null}

        {event.price_info ? (
          <p className="mt-auto pt-3">
            <span className="pill bg-coral-wash text-coral-ink">{event.price_info}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
