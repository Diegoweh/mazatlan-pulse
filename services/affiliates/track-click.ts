"use client";

import { getBrowserSupabase } from "@/lib/supabase/client";

/**
 * Bumps click_count through a security-definer RPC. There is no UPDATE policy on
 * affiliate_deals for anon — the function is the entire write surface, and it can
 * only ever increment a counter on an active row.
 *
 * Fire-and-forget: a failed count must never block the outbound affiliate click.
 */
export function trackAffiliateClick(slug: string): void {
  const supabase = getBrowserSupabase();
  if (!supabase) return;

  void supabase.rpc("increment_affiliate_click", { deal_slug: slug }).then(({ error }) => {
    if (error) console.warn("[affiliates] click tracking failed:", error.message);
  });
}
