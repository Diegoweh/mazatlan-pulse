import { siteConfig } from "@/lib/site";

/**
 * Offset of a named time zone at a given instant, in minutes east of UTC.
 *
 * Computed from the runtime's tz database rather than hardcoded: Mexico dropped
 * DST in 2022, so Mazatlán is UTC-7 year round today, but a hardcoded -07:00
 * would silently shift every event by an hour if that ever changes again.
 */
function zoneOffsetMinutes(timeZone: string, at: Date): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  }).format(at);

  // "9/29/2026, GMT-07:00" → -420
  const match = formatted.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
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
