import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { EventRow } from "@/types";

import { EventForm } from "../EventForm";

export const metadata: Metadata = {
  title: "Edit event",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

async function EventEditor({ params }: Props) {
  const { id } = await params;

  if (!(await requireAdmin())) {
    return (
      <p className="text-sm">
        <Link href={`/admin/login?next=/admin/events/${id}`} className="underline">
          Sign in
        </Link>{" "}
        to edit events.
      </p>
    );
  }

  // "new" is a sentinel, not a uuid.
  if (id === "new") return <EventForm event={null} />;

  const supabase = getAdminSupabase();
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();

  if (error) return <p className="text-red-600">Failed to load event: {error.message}</p>;
  if (!data) notFound();

  return <EventForm event={data as EventRow} />;
}

export default function AdminEventPage(props: Props) {
  return (
    <div className="space-y-6">
      <Link href="/admin/events" className="text-sm underline">
        ← All events
      </Link>
      <Suspense fallback={<p className="text-black/50">Loading…</p>}>
        <EventEditor params={props.params} />
      </Suspense>
    </div>
  );
}
