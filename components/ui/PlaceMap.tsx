"use client";

import dynamic from "next/dynamic";

/** Client boundary for the single-pin map; see BusRouteMap for why it exists. */
const PlaceMapClient = dynamic(() => import("./PlaceMapClient"), {
  ssr: false,
  loading: () => <div className="h-[320px] animate-pulse bg-navy/[0.04]" aria-hidden />,
});

export function PlaceMap({
  lat,
  lng,
  name,
  query,
}: {
  lat: number;
  lng: number;
  name: string;
  /** Search text for the Google Maps hand-off link. */
  query: string;
}) {
  // Plain link, not an embed: nothing is sent to Google until the visitor taps it.
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="card overflow-hidden">
      <PlaceMapClient lat={lat} lng={lng} name={name} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
        <p className="text-sm font-semibold text-navy">{name}</p>
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-teal-ink hover:underline"
        >
          Open in Google Maps →
        </a>
      </div>
    </div>
  );
}
