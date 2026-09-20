import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { requireEnv } from "@/lib/env";
import type { Database } from "@/types";

/**
 * service_role client. Bypasses RLS entirely — this is the ONLY write path in the
 * system (ingest scripts, cron route, admin server actions).
 *
 * `server-only` makes an accidental import from a Client Component a build error.
 * Never call this inside a `use cache` function.
 */
export function getAdminSupabase(): SupabaseClient<Database> {
  return createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
