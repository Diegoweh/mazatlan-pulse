import Link from "next/link";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/supabase/server-auth";

async function AdminIdentity() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <form action="/admin/auth/signout" method="post" className="flex items-center gap-3">
      <span className="text-xs text-black/50 dark:text-white/50">{user.email}</span>
      <button type="submit" className="text-xs underline">
        Sign out
      </button>
    </form>
  );
}

/**
 * Chrome only — no auth gate here. Each admin page gates itself with
 * requireAdmin(), so /admin/login stays reachable while signed out.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-3 dark:border-white/15">
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/review" className="hover:underline">
            Review queue
          </Link>
          <Link href="/admin/bus-routes" className="hover:underline">
            Bus routes
          </Link>
          <Link href="/admin/affiliate-deals" className="hover:underline">
            Affiliate deals
          </Link>
        </nav>
        <Suspense fallback={null}>
          <AdminIdentity />
        </Suspense>
      </div>
      {children}
    </div>
  );
}
