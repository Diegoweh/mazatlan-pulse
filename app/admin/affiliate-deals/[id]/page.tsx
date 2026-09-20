import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { AffiliateDealRow } from "@/types";

import { AffiliateDealForm } from "../AffiliateDealForm";

export const metadata: Metadata = {
  title: "Edit affiliate deal",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

async function DealEditor({ params }: Props) {
  const { id } = await params;

  if (!(await requireAdmin())) {
    return (
      <p className="text-sm">
        <Link href={`/admin/login?next=/admin/affiliate-deals/${id}`} className="underline">
          Sign in
        </Link>{" "}
        to edit deals.
      </p>
    );
  }

  // "new" is a sentinel, not a uuid.
  if (id === "new") return <AffiliateDealForm deal={null} />;

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("affiliate_deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return <p className="text-red-600">Failed to load deal: {error.message}</p>;
  if (!data) notFound();

  return <AffiliateDealForm deal={data as AffiliateDealRow} />;
}

export default function AdminAffiliateDealPage(props: Props) {
  return (
    <div className="space-y-6">
      <Link href="/admin/affiliate-deals" className="text-sm underline">
        ← All deals
      </Link>
      <Suspense fallback={<p className="text-black/50">Loading…</p>}>
        <DealEditor params={props.params} />
      </Suspense>
    </div>
  );
}
