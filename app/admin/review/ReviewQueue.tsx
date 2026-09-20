"use client";

import { useState, useTransition } from "react";

import { formatEventDate } from "@/lib/utils";
import type { EventRow } from "@/types";

import { approveEvent, rejectEvent } from "./actions";

/**
 * Minimal approval UI. The point is to make the pipeline auditable before we
 * trust it — the reviewer sees the model's output next to the raw scraped text
 * and the original listing.
 */
export function ReviewQueue({ events }: { events: EventRow[] }) {
  const [pending, startTransition] = useTransition();
  const [resolved, setResolved] = useState<Record<string, string>>({});

  if (events.length === 0) {
    return <p className="text-black/60 dark:text-white/60">Queue is empty.</p>;
  }

  function act(id: string, action: "approve" | "reject") {
    startTransition(async () => {
      const result =
        action === "approve" ? await approveEvent(id) : await rejectEvent(id);
      setResolved((prev) => ({ ...prev, [id]: result.message }));
    });
  }

  return (
    <ul className="space-y-6">
      {events.map((event) => (
        <li
          key={event.id}
          className="space-y-3 rounded-xl border border-black/10 p-4 dark:border-white/15"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <span className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
              {event.category} · {event.ai_model ?? "manual"}
            </span>
          </div>

          <p className="text-sm">
            <time dateTime={event.starts_at}>{formatEventDate(event.starts_at)}</time>
            {event.venue_name ? ` · ${event.venue_name}` : " · no venue"}
            {event.price_info ? ` · ${event.price_info}` : ""}
          </p>

          <p className="text-sm text-black/70 dark:text-white/70">{event.description_en}</p>

          <details className="text-xs text-black/60 dark:text-white/60">
            <summary className="cursor-pointer">Raw scraped text (audit only)</summary>
            <p className="mt-2 whitespace-pre-wrap">{event.description_original}</p>
          </details>

          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs underline"
          >
            {event.source_name} — open original listing
          </a>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={pending || Boolean(resolved[event.id])}
              onClick={() => act(event.id, "approve")}
              className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Approve &amp; publish
            </button>
            <button
              type="button"
              disabled={pending || Boolean(resolved[event.id])}
              onClick={() => act(event.id, "reject")}
              className="rounded-lg border border-black/20 px-3 py-1.5 text-sm dark:border-white/25"
            >
              Reject
            </button>
            {resolved[event.id] ? (
              <span className="text-sm text-black/60 dark:text-white/60">{resolved[event.id]}</span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
