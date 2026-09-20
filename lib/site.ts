export const siteConfig = {
  name: "Mazatlán Pulse",
  // Domain not locked in yet — everything canonical reads from this one value.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}
