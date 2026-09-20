import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site";

const NAV = [
  { href: "/bus-routes", label: "Bus routes" },
  { href: "/events", label: "Events" },
  { href: "/tours", label: "Tours" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-sand/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-5 py-3 sm:px-6">
        <Link href="/" className="shrink-0" aria-label={`${siteConfig.name} home`}>
          <Image
            src="/logo-wordmark.png"
            alt={siteConfig.name}
            width={691}
            height={353}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav aria-label="Main">
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-teal-wash hover:text-teal-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Sunset hairline: the one place coral gets to run edge to edge. */}
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-teal via-coral to-transparent opacity-70"
      />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-navy text-sand">
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-12 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-sm space-y-2">
            <p className="font-display text-xl text-white">{siteConfig.name}</p>
            <p className="text-sm leading-relaxed text-sand/70">
              An independent English-language guide to {siteConfig.city.name},{" "}
              {siteConfig.city.region} — written for visitors who&apos;d rather figure the city
              out than be herded through it.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="space-y-2 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sand/80 transition-colors hover:text-coral">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="border-t border-white/10 pt-6 text-xs leading-relaxed text-sand/55">
          Some links are affiliate links; we may earn a commission at no extra cost to you. Event
          listings are summarized from public sources and link back to the original. Fares and
          schedules change — confirm locally before you travel.
        </p>
      </div>
    </footer>
  );
}
