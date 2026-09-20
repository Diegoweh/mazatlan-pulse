import { NextResponse, type NextRequest } from "next/server";

import { getServerAuthSupabase } from "@/lib/supabase/server-auth";

/** POST-only: a GET sign-out would be triggerable by any image tag or prefetch. */
export async function POST(request: NextRequest) {
  const supabase = await getServerAuthSupabase();
  await supabase?.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
}
