import { ImageResponse } from "next/og";

import { OG_SIZE, OgFrame, ogFonts } from "@/lib/og/brand";
import { formatMxn } from "@/lib/utils";
import { getBusRouteBySlug } from "@/services/transport/queries";

export const alt = "Mazatlán bus route guide";
export const size = OG_SIZE;
export const contentType = "image/png";

// No searchParams here by design — OG routes only get params.
type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const route = await getBusRouteBySlug(slug);

  // A deleted or unpublished route still gets a valid card rather than a 500.
  if (!route) {
    return new ImageResponse(
      <OgFrame eyebrow="Getting around" title="Mazatlán bus routes" />,
      { ...size, fonts: ogFonts },
    );
  }

  const meta = [
    route.fare_mxn !== null ? formatMxn(route.fare_mxn) : null,
    `${route.key_stops.length} key stops`,
    route.operating_hours,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return new ImageResponse(
    <OgFrame eyebrow="Bus route · Mazatlán" title={route.route_name} meta={meta} />,
    { ...size, fonts: ogFonts },
  );
}
