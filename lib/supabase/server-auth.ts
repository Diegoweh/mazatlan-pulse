import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { hasPublicSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/types";

/**
 * Cookie-bound server client, for reading the signed-in admin's session.
 *
 * Request-scoped: calling this marks the caller dynamic, so it must never be used
 * inside a `use cache` function. Public page data goes through
 * `getPublicSupabase()` instead.
 */
export async function getServerAuthSupabase() {
  if (!hasPublicSupabaseEnv()) return null;
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — refresh is handled in proxy.ts/actions.
        }
      },
    },
  });
}

/** Returns the signed-in user, or null. The admin UI uses this as its gate. */
export async function getCurrentUser() {
  const supabase = await getServerAuthSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
