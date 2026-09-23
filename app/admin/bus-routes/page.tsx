import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { formatMxn } from "@/lib/utils";
import type { BusRouteRow } from "@/types";

export const metadata: Metadata = {
  title: "Bus routes",
  robots: { index: false, follow: false },
};

async function RouteList() {
  if (!(await requireAdmin())) {
    return (
      <p className="text-sm">
        <Link href="/admin/login?next=/admin/bus-routes" className="underline">
          Sign in
        </Link>{" "}
        with an address listed in <code>ADMIN_EMAILS</code>.
      </p>
    );
  }

  // Service role: the admin list includes inactive routes, which anon can't read.
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("bus_routes")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("route_name", { ascending: true });

  if (error) return <p className="text-red-600">Failed to load routes: {error.message}</p>;

  const routes = (data ?? []) as BusRouteRow[];
  if (routes.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        No routes yet. Create the first one — Sábalo–Centro is the one most visitors need.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/10 dark:divide-white/15">
      {routes.map((route) => (
        <li key={route.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <Link href={`/admin/bus-routes/${route.id}`} className="font-medium hover:underline">
              {route.route_name}
            </Link>
            <p className="text-xs text-black/50 dark:text-white/50">
              {route.key_stops.length} stops
              {route.fare_mxn !== null ? ` · ${formatMxn(route.fare_mxn)}` : " · no fare"}
              {route.last_verified_at ? "" : " · unverified"}
              {` · order ${route.sort_order}`}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
              route.is_active
                ? "bg-teal-600/10 text-teal-700 dark:text-teal-300"
                : "bg-black/10 text-black/60 dark:bg-white/10 dark:text-white/60"
            }`}
          >
            {route.is_active ? "Live" : "Draft"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function AdminBusRoutesPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bus routes</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Curated by hand. Verify on the ground before marking a route verified.
          </p>
        </div>
        <Link
          href="/admin/bus-routes/new"
          className="shrink-0 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white"
        >
          New route
        </Link>
      </header>

      <Suspense fallback={<p className="text-black/50">Loading routes…</p>}>
        <RouteList />
      </Suspense>
    </div>
  );
}
