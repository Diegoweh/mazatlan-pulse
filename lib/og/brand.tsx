import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared pieces for every generated social card.
 *
 * Assets are read once at module scope: they never depend on request data, so
 * re-reading them per image would just be work. Fonts are TTF because satori
 * (what next/og renders with) cannot parse woff2 — the format next/font ships.
 */
const assets = join(process.cwd(), "assets");

export const [frauncesBold, karlaMedium, karlaBold, logoBase64] = await Promise.all([
  readFile(join(assets, "Fraunces-Bold.ttf")),
  readFile(join(assets, "Karla-Medium.ttf")),
  readFile(join(assets, "Karla-Bold.ttf")),
  readFile(join(process.cwd(), "public", "logo-wordmark.png"), "base64"),
]);

export const logoSrc = `data:image/png;base64,${logoBase64}`;

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const ogFonts = [
  { name: "Fraunces", data: frauncesBold, style: "normal" as const, weight: 700 as const },
  { name: "Karla", data: karlaMedium, style: "normal" as const, weight: 500 as const },
  { name: "Karla", data: karlaBold, style: "normal" as const, weight: 700 as const },
];

export const BRAND = {
  navy: "#102A35",
  teal: "#2D7C7A",
  coral: "#E87561",
  sand: "#F7F4EE",
  ink: "#172126",
  muted: "#5E6D74",
  line: "#E4E0D7",
} as const;

/**
 * The card shell: warm sand field, a teal crescent bleeding off the right edge
 * that echoes the logo's mark, and the coral rule as the one hot accent.
 *
 * Every element sets display:flex — satori requires it on any node with more
 * than one child and throws otherwise.
 */
export function OgFrame({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: BRAND.sand,
        padding: "64px 72px",
        position: "relative",
        fontFamily: "Karla",
      }}
    >
      {/* Crescent, cropped by the frame — the logo's shape at poster scale. */}
      <div
        style={{
          position: "absolute",
          right: -210,
          top: -150,
          width: 620,
          height: 620,
          borderRadius: "50%",
          border: `70px solid ${BRAND.teal}`,
          opacity: 0.22,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -90,
          bottom: -260,
          width: 420,
          height: 420,
          borderRadius: "50%",
          backgroundColor: BRAND.coral,
          opacity: 0.14,
          display: "flex",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* Raw <img> on purpose: this tree is rendered by satori, not the DOM —
            next/image does not exist here and would throw. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} height={104} alt="" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: BRAND.teal,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontFamily: "Fraunces",
            fontSize: title.length > 46 ? 62 : 76,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            color: BRAND.navy,
          }}
        >
          {title}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", width: 132, height: 6, backgroundColor: BRAND.coral }} />
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 26,
            color: BRAND.muted,
          }}
        >
          {meta ?? "mazatlanpulse.com.mx"}
        </div>
      </div>
    </div>
  );
}
