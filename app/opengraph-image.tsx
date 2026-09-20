import { ImageResponse } from "next/og";

import { OG_SIZE, OgFrame, ogFonts } from "@/lib/og/brand";

export const alt = "Mazatlán Pulse — bus routes, events and tours in Mazatlán, in English";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Mazatlán, Sinaloa · in English"
        title="Get around Mazatlán like you already live here"
      />
    ),
    { ...size, fonts: ogFonts },
  );
}
