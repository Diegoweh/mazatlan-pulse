/**
 * Copies MapLibre's worker bundle into /public so it can be served at a stable URL.
 *
 * Why this exists: MapLibre resolves its worker with `import.meta.url` relative to
 * its own module. Turbopack rewrites that to a chunk URL where the worker file
 * doesn't exist, so the map dies with "Worker failed to load." Serving the worker
 * ourselves and pointing `setWorkerUrl()` at it sidesteps bundler resolution.
 *
 * Runs from `predev` and `prebuild`, so the copy can never drift from the
 * installed maplibre-gl version. public/maplibre/ is gitignored for that reason.
 */
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

// The worker imports ./maplibre-gl-shared.mjs relatively, so both must sit
// together in the destination directory.
const FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

const dist = dirname(require.resolve("maplibre-gl/dist/maplibre-gl.mjs"));
const outDir = join(process.cwd(), "public", "maplibre");

await mkdir(outDir, { recursive: true });
for (const file of FILES) {
  await copyFile(join(dist, file), join(outDir, file));
}

const { version } = JSON.parse(await readFile(require.resolve("maplibre-gl/package.json"), "utf8"));
console.log(`[maplibre] worker ${version} synced to public/maplibre/`);
