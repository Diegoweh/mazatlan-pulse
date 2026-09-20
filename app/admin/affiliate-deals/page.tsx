import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { AffiliateDealRow } from "@/types";

export const metadata: Metadata = {
  title: "Affiliate deals",
  robots: { index: false, follow: false },
};

async function DealList() {
  if (!(await requireAdmin())) {
    return (
      <p className="text-sm">
        <Link href="/admin/login?next=/admin/affiliate-deals" className="underline">
          Sign in
        </Link>{" "}
        with an address listed in <code>ADMIN_EMAILS</code>.
      </p>
    );
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("affiliate_deals")
    .select("*")
    .order("click_count", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) return <p className="text-red-600">Failed to load deals: {error.message}</p>;

  const deals = (data ?? []) as AffiliateDealRow[];
  if (deals.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        No deals yet. Add a few hand-picked tours and an airport transfer — that&apos;s the whole
        monetization path for the MVP.
      </p>
    );
  }

  const totalClicks = deals.reduce((sum, deal) => sum + deal.click_count, 0);

  return (
    <>
      <p className="text-xs text-black/50 dark:text-white/50">
        {deals.length} deal{deals.length === 1 ? "" : "s"} · {totalClicks} total click
        {totalClicks === 1 ? "" : "s"}
      </p>
      <ul className="divide-y divide-black/10 dark:divide-white/15">
        {deals.map((deal) => (
          <li key={deal.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <Link
                href={`/admin/affiliate-deals/${deal.id}`}
                className="font-medium hover:underline"
              >
                {deal.title}
              </Link>
              <p className="truncate text-xs text-black/50 dark:text-white/50">
                {deal.provider} · {deal.category.replace("_", " ")}
                {deal.estimated_commission_pct !== null
                  ? ` · ${deal.estimated_commission_pct}% commission`
                  : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs tabular-nums text-black/50 dark:text-white/50">
                {deal.click_count} clicks
              </span>
              {deal.is_featured ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                  Featured
                </span>
              ) : null}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  deal.is_active
                    ? "bg-teal-600/10 text-teal-700 dark:text-teal-300"
                    : "bg-black/10 text-black/60 dark:bg-white/10 dark:text-white/60"
                }`}
              >
                {deal.is_active ? "Live" : "Paused"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function AdminAffiliateDealsPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Affiliate deals</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Hand-picked. Sorted by clicks so the ones earning their place float up.
          </p>
        </div>
        <Link
          href="/admin/affiliate-deals/new"
          className="shrink-0 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white"
        >
          New deal
        </Link>
      </header>

      <Suspense fallback={<p className="text-black/50">Loading deals…</p>}>
        <DealList />
      </Suspense>
    </div>
  );
}
