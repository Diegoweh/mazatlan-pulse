import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";

import { JsonLd } from "@/components/ui/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/ui/SiteChrome";
import { websiteSchema } from "@/lib/schema-org";
import { siteConfig } from "@/lib/site";

import "./globals.css";

// Fraunces: a warm, slightly wonky display serif. Picked to sit next to the
// script wordmark without competing with it.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
  display: "swap",
});

// Karla for body: humanist, open counters, holds up in 250-word route guides.
const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Events, Buses & Tours in Mazatlán`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — Events, Buses & Tours in Mazatlán`,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Tells Next to suppress smooth scrolling during route transitions.
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${karla.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd schema={websiteSchema()} />
        <a
          href="#main"
          className="sr-only rounded-full bg-navy px-4 py-2 text-sand focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <SiteHeader />
        {/* No container here: a full-bleed hero can't escape one without 100vw
            tricks that add a horizontal scrollbar. Pages apply .page-shell. */}
        <main id="main" className="w-full flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
