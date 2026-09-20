import Link from "next/link";

import { siteConfig } from "@/lib/site";

const NAV = [
  { href: "/events", label: "Events" },
  { href: "/bus-routes", label: "Bus routes" },
  { href: "/tours", label: "Tours" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {siteConfig.name}
        </Link>
        <ul className="flex gap-5 text-sm">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-black/10 py-8 text-sm text-black/60 dark:border-white/15 dark:text-white/60">
      <div className="mx-auto max-w-5xl space-y-2 px-4">
        <p>
          {siteConfig.name} — independent English-language guide to {siteConfig.city.name},{" "}
          {siteConfig.city.region}.
        </p>
        <p>
          Some links are affiliate links; we may earn a commission at no extra cost to you. Event
          listings are summarized from public sources and link back to the original.
        </p>
      </div>
    </footer>
  );
}
