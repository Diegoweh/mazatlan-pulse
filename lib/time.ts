import { siteConfig } from "@/lib/site";

/**
 * Offset of a named time zone at a given instant, in minutes east of UTC.
 *
 * Computed from the runtime's tz database rather than hardcoded: Mexico dropped
 * DST in 2022, so Mazatlán is UTC-7 year round today, but a hardcoded -07:00
 * would silently shift every event by an hour if that ever changes again.
 */
function zoneOffsetMinutes(timeZone: string, at: Date): number {
  // formatToParts, not a regex over the formatted string. Some ICU builds render
  // the sign as U+2212 MINUS SIGN rather than ASCII "-", so /GMT([+-])/ silently
  // fails to match and the offset comes back as 0 — which stores a Mazatlán time
  // as though it were UTC. Reading numeric parts avoids display formatting
  // entirely.
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(at)
      .map((part) => [part.type, part.value]),
  );

  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  // Drop sub-second precision on both sides so the difference is a clean offset.
  return (asIfUtc - Math.floor(at.getTime() / 1000) * 1000) / 60_000;
}

/**
 * Turns a <input type="datetime-local"> value ("2026-10-04T21:00") into an ISO
 * instant, reading it as Mazatlán wall-clock time.
 *
 * The browser gives a naive string with no zone. Passing it to new Date()
 * interprets it in the *admin's* zone, so an editor travelling or working from
 * another country would file every event at the wrong hour.
 */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  // Read the naive string as if it were UTC, then correct by the zone's offset
  // at that moment.
  const provisional = new Date(`${value.length === 16 ? `${value}:00` : value}Z`);
  if (Number.isNaN(provisional.getTime())) return null;

  const offset = zoneOffsetMinutes(siteConfig.timeZone, provisional);
  return new Date(provisional.getTime() - offset * 60_000).toISOString();
}

/** Inverse of fromLocalInput, for pre-filling the form when editing. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const offset = zoneOffsetMinutes(siteConfig.timeZone, date);
  const shifted = new Date(date.getTime() + offset * 60_000);
  return shifted.toISOString().slice(0, 16);
}

/**
 * Human-readable echo of a datetime-local value, in site time.
 *
 * The form stores Mazatlán wall time, but the browser widget shows the value in
 * whatever format the visitor's locale uses — a 24-hour widget makes "09:00"
 * look unremarkable when the editor meant 9 PM. Printing the parsed result back
 * in words makes that mistake visible before it reaches the site.
 */
export function describeLocal(localValue: string): string | null {
  const iso = fromLocalInput(localValue);
  if (!iso) return null;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: siteConfig.timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
