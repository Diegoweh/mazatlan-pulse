import type { MetadataRoute } from "next";

import { absoluteUrl, isCanonicalHost } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments and the *.vercel.app fallback must never be indexed —
  // they'd compete with the real domain as duplicate content, and their pages
  // would carry canonicals pointing at the wrong origin.
  if (!isCanonicalHost) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
