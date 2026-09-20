import { cacheLife, cacheTag } from "next/cache";

import { getPublicSupabase } from "@/lib/supabase/public";
import type { AffiliateCategory, AffiliateDealRow } from "@/types";

export const AFFILIATE_CACHE_TAG = "affiliate-deals";

export async function getAffiliateDeals(options?: {
  category?: AffiliateCategory;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<AffiliateDealRow[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(AFFILIATE_CACHE_TAG);

  const supabase = getPublicSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("affiliate_deals")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 24);

  if (options?.category) query = query.eq("category", options.category);
  if (options?.featuredOnly) query = query.eq("is_featured", true);

  const { data, error } = await query;
  if (error) {
    console.error("[affiliates] getAffiliateDeals failed:", error.message);
    return [];
  }
  return data ?? [];
}
