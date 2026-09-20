import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { BusRouteRow } from "@/types";

import { BusRouteForm } from "../BusRouteForm";

export const metadata: Metadata = {
  title: "Edit bus route",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

async function RouteEditor({ params }: Props) {
  const { id } = await params;

  if (!(await requireAdmin())) {
    return (
      <p className="text-sm">
        <Link href={`/admin/login?next=/admin/bus-routes/${id}`} className="underline">
          Sign in
        </Link>{" "}
        to edit routes.
      </p>
    );
  }

  // "new" is a sentinel, not a uuid — the form renders empty for it.
  if (id === "new") return <BusRouteForm route={null} />;

  const supabase = getAdminSupabase();
  const { data, error } = await supabase.from("bus_routes").select("*").eq("id", id).maybeSingle();

  if (error) return <p className="text-red-600">Failed to load route: {error.message}</p>;
  if (!data) notFound();

  return <BusRouteForm route={data as BusRouteRow} />;
}

export default function AdminBusRoutePage(props: Props) {
  return (
    <div className="space-y-6">
      <Link href="/admin/bus-routes" className="text-sm underline">
        ← All routes
      </Link>
      <Suspense fallback={<p className="text-black/50">Loading…</p>}>
        <RouteEditor params={props.params} />
      </Suspense>
    </div>
  );
}
