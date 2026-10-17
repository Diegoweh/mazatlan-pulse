"use client";

import { contact, contactDisplay } from "@/lib/contact";

/**
 * A button rather than a mailto link: the address is assembled at click time,
 * so it is never present in the HTML for harvesters to scrape. The readable
 * "(at)" form beside it covers anyone who prefers to copy it by hand.
 */
export function ContactEmail({ subject }: { subject?: string }) {
  function open() {
    const address = `${contact.user}@${contact.domain}`;
    const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
    window.location.href = `mailto:${address}${query}`;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button type="button" onClick={open} className="btn-secondary px-4 py-2 text-sm">
        Send an email
      </button>
      <span className="text-sm text-muted">{contactDisplay}</span>
    </span>
  );
}
