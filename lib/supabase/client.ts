"use client";

import { createBrowserClient } from "@supabase/ssr";

import { hasPublicSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/types";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Browser client. Anon key only — used for auth and the click-tracking RPC. */
export function getBrowserSupabase() {
  if (!hasPublicSupabaseEnv()) return null;
  cached ??= createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
  return cached;
}
