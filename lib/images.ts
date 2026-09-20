/**
 * Single source of truth for remote image hosts.
 *
 * next.config.ts feeds this to `images.remotePatterns`, and the admin validates
 * against it on save. Without the second half, a deal saved with an unlisted host
 * renders fine in the admin and then throws at request time on the public page —
 * next/image refuses any host that isn't configured.
 */
export const REMOTE_IMAGE_HOSTS = [
  // Supabase Storage, for anything we host ourselves.
  { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
  // Affiliate partner CDNs.
  { protocol: "https", hostname: "*.viator.com" },
  { protocol: "https", hostname: "*.getyourguide.com" },
  { protocol: "https", hostname: "*.tacdn.com" },
  { protocol: "https", hostname: "*.bstatic.com" },
] as const satisfies ReadonlyArray<{
  protocol: "https";
  hostname: string;
  pathname?: string;
}>;

function hostnameMatches(pattern: string, hostname: string): boolean {
  if (pattern.startsWith("*.")) {
    const suffix = pattern.slice(1); // ".viator.com"
    return hostname.endsWith(suffix) && hostname.length > suffix.length;
  }
  return pattern === hostname;
}

/** Human-readable host list, for error messages in the admin. */
export function allowedImageHosts(): string[] {
  return REMOTE_IMAGE_HOSTS.map((host) => host.hostname);
}

export function isAllowedImageUrl(rawUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;

  return REMOTE_IMAGE_HOSTS.some((host) => {
    if (!hostnameMatches(host.hostname, url.hostname)) return false;
    if (!("pathname" in host) || !host.pathname) return true;
    // Only the trailing /** wildcard is used above; compare the literal prefix.
    const prefix = host.pathname.replace(/\*\*$/, "");
    return url.pathname.startsWith(prefix);
  });
}
