"use client";

import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { BusStop, RoutePath } from "@/types";

import "maplibre-gl/dist/maplibre-gl.css";

/**
 * OpenFreeMap: OpenStreetMap vector tiles, no API key, no account, no billing.
 * Swapping to MapTiler or a self-hosted style is a one-line change here.
 */
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/**
 * A two-point route_path is just the endpoints — drawing a line through them
 * would render a straight bar across the city, over buildings and water, and
 * claim it's the bus route. We only draw the line once the path is genuinely
 * traced. Markers come from key_stops and are always accurate.
 */
const MIN_PATH_POINTS = 3;

const BRAND = { teal: "#2D7C7A", coral: "#E87561", navy: "#102A35" };

/**
 * MapLibre normally finds its worker via `import.meta.url` relative to its own
 * module. Turbopack rewrites that to a chunk URL where the worker file does not
 * exist, and the map fails with "Worker failed to load."
 *
 * We serve the worker ourselves from /public (kept in sync by
 * scripts/sync-maplibre-worker.mjs) and point MapLibre straight at it.
 */
let workerConfigured = false;
function configureWorker() {
  if (workerConfigured) return;
  setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
  workerConfigured = true;
}

/**
 * Every stop looks the same on purpose. These routes run as loops, so there is
 * no terminus — colouring the last entry differently would invent one.
 */
function markerElement(label: string) {
  const el = document.createElement("div");
  el.textContent = label;
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "26px",
    height: "26px",
    borderRadius: "999px",
    background: BRAND.teal,
    color: "#fff",
    font: "700 12px/1 ui-sans-serif, system-ui, sans-serif",
    border: "2px solid #fff",
    boxShadow: "0 1px 6px rgba(16,42,53,.35)",
    cursor: "pointer",
  });
  return el;
}

export default function BusRouteMapClient({
  stops,
  path,
  routeName,
  className,
}: {
  stops: BusStop[];
  path: RoutePath;
  routeName?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [failed, setFailed] = useState(false);

  const ordered = [...stops].sort((a, b) => a.order - b.order);
  const hasTracedPath = path.length >= MIN_PATH_POINTS;

  /**
   * Identity of what's drawn. Client-side navigation between two routes reuses
   * this component instance — same type, same slot in the tree — so without a
   * dependency that actually changes, the map would keep the previous route's
   * markers. Rebuilding is cheap here because it only happens on navigation.
   */
  const drawing = JSON.stringify({ ordered, path: hasTracedPath ? path : null });

  useEffect(() => {
    if (!containerRef.current || ordered.length === 0 || mapRef.current) return;

    configureWorker();
    // Stale failure from a previous route would otherwise stick to a working map.
    setFailed(false);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL,
      // Mazatlán; immediately overridden by fitBounds once stops are known.
      center: [ordered[0].lng, ordered[0].lat],
      zoom: 12,
      attributionControl: { compact: true },
      // Let the page scroll instead of trapping the wheel; ctrl+wheel still zooms.
      cooperativeGestures: true,
    });
    mapRef.current = map;

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.on("error", () => setFailed(true));

    map.on("load", () => {
      if (hasTracedPath) {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            // GeoJSON is [lng, lat]; our stored pairs are [lat, lng].
            geometry: { type: "LineString", coordinates: path.map(([lat, lng]) => [lng, lat]) },
          },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": BRAND.teal, "line-width": 4, "line-opacity": 0.85 },
        });
      }

      for (const stop of ordered) {
        new Marker({ element: markerElement(String(stop.order)) })
          .setLngLat([stop.lng, stop.lat])
          .setPopup(
            new Popup({ offset: 18, closeButton: false }).setText(
              `${stop.order}. ${stop.name}`,
            ),
          )
          .addTo(map);
      }

      const bounds = new LngLatBounds();
      for (const stop of ordered) bounds.extend([stop.lng, stop.lat]);
      if (hasTracedPath) for (const [lat, lng] of path) bounds.extend([lng, lat]);
      map.fitBounds(bounds, { padding: 56, maxZoom: 14, animate: !reduceMotion });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // `drawing` is the serialized stops + path: it changes exactly when the map
    // needs rebuilding, and `routeName` only feeds the aria-label.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing]);

  if (ordered.length === 0) return null;

  return (
    <div className={cn("card overflow-hidden", className)}>
      <div
        ref={containerRef}
        role="application"
        aria-label={`Map of ${routeName ?? "the route"} showing ${ordered.length} key stops`}
        className="h-[380px] w-full bg-teal-wash"
      />
      {failed ? (
        <p className="border-t border-line px-5 py-3 text-sm text-muted">
          The map couldn&apos;t load. The stop list below has the same information.
        </p>
      ) : null}
      <p className="border-t border-line px-5 py-3 text-xs leading-relaxed text-muted">
        <span className="font-semibold text-navy">These routes run as loops.</span> Numbers are
        travel order, not a start and a finish — you can board anywhere on the circuit.
        {!hasTracedPath
          ? " Markers are verified stops; the street-by-street path isn't drawn yet, because we'd rather show nothing than guess the roads the bus takes."
          : null}
      </p>
    </div>
  );
}
