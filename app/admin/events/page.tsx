import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { formatEventDate } from "@/lib/utils";
import type { EventRow } from "@/types";

export const metadata: Metadata = {
  title: "Events",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<EventRow["status"], string> = {
  published: "bg-teal-600/10 text-teal-700",
  pending_review: "bg-amber-500/15 text-amber-700",
  rejected: "bg-red-500/10 text-red-700",
  archived: "bg-black/10 text-black/60",
};

async function EventList() {
  if (!(await requireAdmin())) {
    return (
      <p className="text-sm">
        <Link href="/admin/login?next=/admin/events" className="underline">
          Sign in
        </Link>{" "}
        with an address listed in <code>ADMIN_EMAILS</code>.
      </p>
    );
  }

  // Service role: the list shows every status, including drafts the anon role
  // can't see.
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false })
    .limit(200);

  if (error) return <p className="text-red-600">Failed to load events: {error.message}</p>;

  const events = (data ?? []) as EventRow[];
  if (events.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        No events yet. Paste a post from a venue&apos;s page and the form will draft it for you.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/10 dark:divide-white/15">
      {events.map((event) => (
        <li key={event.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <Link href={`/admin/events/${event.id}`} className="font-medium hover:underline">
              {event.title}
            </Link>
            <p className="truncate text-xs text-black/50 dark:text-white/50">
              {formatEventDate(event.starts_at)}
              {event.venue_name ? ` · ${event.venue_name}` : ""}
              {event.ai_generated ? ` · drafted by ${event.ai_model ?? "AI"}` : " · written by hand"}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[event.status]}`}
          >
            {event.status.replace("_", " ")}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Paste a post, check the draft, publish. Nothing reaches the site unpublished.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="shrink-0 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white"
        >
          New event
        </Link>
      </header>

      <Suspense fallback={<p className="text-black/50">Loading events…</p>}>
        <EventList />
      </Suspense>
    </div>
  );
}
