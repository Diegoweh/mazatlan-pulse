"use client";

import { Map as MapLibreMap, Marker, NavigationControl } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { BRAND, configureWorker, STYLE_URL } from "@/lib/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

/**
 * One pin on the shared OpenFreeMap style. Used instead of a Google Maps embed,
 * which would load Google scripts and set cookies on a page our privacy policy
 * says sets none.
 */
export default function PlaceMapClient({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    configureWorker();

    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL,
      center: [lng, lat],
      zoom: 14.5,
      attributionControl: { compact: true },
      cooperativeGestures: true,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.on("error", () => setFailed(true));
    new Marker({ color: BRAND.coral }).setLngLat([lng, lat]).addTo(map);

    return () => map.remove();
  }, [lat, lng]);

  return (
    <>
      <div
        ref={containerRef}
        role="application"
        aria-label={`Map showing ${name}`}
        className="h-[320px] w-full bg-teal-wash"
      />
      {failed ? (
        <p className="border-t border-line px-5 py-3 text-sm text-muted">
          The map couldn&apos;t load. Use the Google Maps link below instead.
        </p>
      ) : null}
    </>
  );
}
