import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { EventRow } from "@/types";

import { ReviewQueue } from "./ReviewQueue";

export const metadata: Metadata = {
  title: "Review queue",
  // Belt and braces alongside the robots.ts disallow.
  robots: { index: false, follow: false },
};

async function QueueLoader() {
  // requireAdmin() reads cookies, so this subtree is dynamic — hence the Suspense
  // boundary in the page below (required by Cache Components).
  const user = await requireAdmin();
  if (!user) {
    return (
      <p className="text-black/70 dark:text-white/70">
        <Link href="/admin/login?next=/admin/review" className="underline">
          Sign in
        </Link>{" "}
        with an account listed in <code>ADMIN_EMAILS</code> to review events.
      </p>
    );
  }

  // Service role: the review queue reads pending rows and description_original,
  // neither of which the anon role can see.
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "pending_review")
    .order("starts_at", { ascending: true })
    .limit(100);

  if (error) {
    return <p className="text-red-600">Failed to load queue: {error.message}</p>;
  }

  return <ReviewQueue events={(data ?? []) as EventRow[]} />;
}

export default function AdminReviewPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Event review queue</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Nothing reaches the public site until it is approved here.
        </p>
      </header>

      <Suspense fallback={<p className="text-black/50">Loading queue…</p>}>
        <QueueLoader />
      </Suspense>
    </div>
  );
}
