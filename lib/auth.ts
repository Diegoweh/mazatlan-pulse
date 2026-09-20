import "server-only";

import { getCurrentUser } from "@/lib/supabase/server-auth";

/**
 * Admin allowlist. Supabase auth lets anyone sign up, so authentication alone is
 * not authorization — ADMIN_EMAILS is the actual gate.
 *
 * Move this to a `profiles.role` column once there is more than one admin.
 */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.email) return null;

  const allowlist = adminEmails();
  if (allowlist.length === 0) {
    console.error("[auth] ADMIN_EMAILS is empty — refusing all admin access.");
    return null;
  }
  return allowlist.includes(user.email.toLowerCase()) ? user : null;
}
