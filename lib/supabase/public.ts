import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { hasPublicSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/types";

/**
 * Anon, cookie-free Supabase client for public reads.
 *
 * Deliberately NOT the @supabase/ssr cookie client: reading cookies would make
 * every caller dynamic, and Cache Components forbids request APIs inside
 * `use cache`. Public content is the same for everyone, so RLS on the anon role
 * is all the scoping we need.
 *
 * Returns null when env is unset so a page can render an empty state instead of
 * failing the build.
 */
export function getPublicSupabase(): SupabaseClient<Database> | null {
  if (!hasPublicSupabaseEnv()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[supabase] NEXT_PUBLIC_SUPABASE_* not set — returning empty data.");
    }
    return null;
  }

  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
