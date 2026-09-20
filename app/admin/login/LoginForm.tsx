"use client";

import { useState } from "react";

import { getBrowserSupabase } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site";

type Status = { kind: "idle" | "sent" | "error"; message?: string };

export function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setStatus({ kind: "error", message: "Supabase env is not configured." });
      return;
    }

    setBusy(true);
    const callback = new URL("/admin/auth/callback", siteConfig.url);
    if (next) callback.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callback.toString(),
        // Admins are provisioned deliberately; a magic link must never create one.
        shouldCreateUser: false,
      },
    });
    setBusy(false);

    // Deliberately identical copy on success and on "no such user": the response
    // must not reveal which addresses have accounts.
    setStatus(
      error && error.status !== 400
        ? { kind: "error", message: error.message }
        : { kind: "sent" },
    );
  }

  if (status.kind === "sent") {
    return (
      <p className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/15">
        If that address has an admin account, a sign-in link is on its way. The link expires
        shortly and can only be used once.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm font-medium" htmlFor="email">
        Admin email
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(changeEvent) => setEmail(changeEvent.target.value)}
        className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
        placeholder="you@example.com"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {busy ? "Sending…" : "Email me a sign-in link"}
      </button>
      {status.kind === "error" ? (
        <p className="text-sm text-red-600">{status.message}</p>
      ) : null}
    </form>
  );
}
