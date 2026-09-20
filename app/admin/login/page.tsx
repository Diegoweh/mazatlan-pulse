import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

const ERRORS: Record<string, string> = {
  missing_code: "That link was incomplete. Request a new one.",
  exchange_failed: "That link has expired or was already used. Request a new one.",
};

async function LoginPanel({ searchParams }: Props) {
  const { next, error } = await searchParams;

  return (
    <>
      {error ? (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {ERRORS[error] ?? "Sign-in failed. Request a new link."}
        </p>
      ) : null}
      <LoginForm next={next} />
    </>
  );
}

export default function AdminLoginPage(props: Props) {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Admin sign in</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Passwordless. Only addresses in <code>ADMIN_EMAILS</code> can do anything once signed in.
        </p>
      </header>

      {/* searchParams is runtime data — it has to be read inside a boundary. */}
      <Suspense fallback={<p className="text-sm text-black/50">Loading…</p>}>
        <LoginPanel searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
