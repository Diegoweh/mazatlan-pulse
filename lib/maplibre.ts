import { setWorkerUrl } from "maplibre-gl";

/**
 * OpenFreeMap: OpenStreetMap vector tiles, no API key, no account, no billing.
 * Swapping to MapTiler or a self-hosted style is a one-line change here.
 */
export const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export const BRAND = { teal: "#2D7C7A", coral: "#E87561", navy: "#102A35" };

/**
 * MapLibre normally finds its worker via `import.meta.url` relative to its own
 * module. Turbopack rewrites that to a chunk URL where the worker file does not
 * exist, and the map fails with "Worker failed to load."
 *
 * We serve the worker ourselves from /public (kept in sync by
 * scripts/sync-maplibre-worker.mjs) and point MapLibre straight at it.
 */
let workerConfigured = false;
export function configureWorker() {
  if (workerConfigured) return;
  setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
  workerConfigured = true;
}
