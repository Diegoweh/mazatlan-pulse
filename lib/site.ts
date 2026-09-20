/**
 * Resolves the canonical origin.
 *
 * Order matters: an explicit NEXT_PUBLIC_SITE_URL wins, then Vercel's own
 * production domain, then the per-deployment preview URL, then localhost.
 *
 * Every branch guards against an empty string. `??` is not enough — an env var
 * that is *defined but blank* (easy to do in the Vercel dashboard) is "" and
 * would sail past `??` straight into `new URL("")`.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    // Set automatically by Vercel for Next.js projects.
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;

    // The Vercel vars are bare hostnames; an explicit setting may or may not
    // carry a protocol.
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      // Normalizes and drops any trailing path, so absoluteUrl() stays predictable.
      return new URL(withProtocol).origin;
    } catch {
      console.warn(`[site] Ignoring unparseable site URL: ${JSON.stringify(value)}`);
    }
  }

  return "http://localhost:3000";
}

const siteUrl = resolveSiteUrl();

export const siteConfig = {
  name: "Mazatlán Pulse",
  url: siteUrl,
  description:
    "English-language guide to Mazatlán, Sinaloa: what's on tonight, how the public buses actually work, and the tours worth booking.",
  locale: "en_US",
  timeZone: "America/Mazatlan",
  city: {
    name: "Mazatlán",
    region: "Sinaloa",
    country: "MX",
    lat: 23.2494,
    lng: -106.4111,
  },
} as const;

/**
 * True only on the real production domain.
 *
 * Preview deployments and the *.vercel.app fallback must not be indexed — they
 * would compete with the canonical domain as duplicate content.
 */
export const isCanonicalHost =
  process.env.VERCEL_ENV !== "preview" &&
  !siteUrl.includes(".vercel.app") &&
  !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(siteUrl);

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}
