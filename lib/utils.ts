import { siteConfig } from "@/lib/site";

/** Tiny className joiner. Swap for clsx/tailwind-merge if variants get complex. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Stable, URL-safe slug. Strips accents so "Mazatlán" -> "mazatlan". */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: siteConfig.timeZone,
});

/** Always render event times in Mazatlán local time, never the visitor's. */
export function formatEventDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatMxn(amount: number | null): string | null {
  if (amount === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Trims to a word boundary for meta descriptions. A raw slice() cuts mid-word,
 * which is what search results and social cards then display.
 */
export function truncateForMeta(text: string | null, max = 155): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "")}…`;
}
