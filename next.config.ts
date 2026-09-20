import type { NextConfig } from "next";

import { REMOTE_IMAGE_HOSTS } from "./lib/images";

const nextConfig: NextConfig = {
  // Cache Components (PPR). Static shell is prerendered, data is served from the
  // `use cache` layer with an explicit cacheLife — this is what gives us ISR-style
  // behaviour without hitting Supabase on every request.
  cacheComponents: true,
  // Pairs with cacheComponents for ISR: an App Shell is served instantly for a
  // slug that wasn't in generateStaticParams, then upgraded in the background.
  partialPrefetching: true,
  images: {
    // Shared with the admin's save-time validation — see lib/images.ts.
    remotePatterns: [...REMOTE_IMAGE_HOSTS],
  },
};

export default nextConfig;
