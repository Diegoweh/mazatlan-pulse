import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { ScrapedItem } from "@/services/scraping/types";

/**
 * Drops items whose source_url is already in the table, in any status.
 *
 * Checking every status matters: a rejected event must stay rejected instead of
 * being re-proposed on the next run, and `events.source_url` is UNIQUE so an
 * insert would fail anyway. This just saves the LLM call.
 */
export async function filterNewItems(items: ScrapedItem[]): Promise<ScrapedItem[]> {
  if (items.length === 0) return [];

  const supabase = getAdminSupabase();
  const urls = items.map((item) => item.sourceUrl);

  const { data, error } = await supabase.from("events").select("source_url").in("source_url", urls);

  if (error) {
    // Fail closed: re-processing costs money and risks duplicates.
    console.error("[dedupe] lookup failed, skipping batch:", error.message);
    return [];
  }

  const known = new Set((data ?? []).map((row) => row.source_url));
  return items.filter((item) => !known.has(item.sourceUrl));
}
