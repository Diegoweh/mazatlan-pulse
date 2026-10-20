import { schedule, type Series } from "@/content/baseball";
import { siteConfig } from "@/lib/site";

export interface DatedSeries extends Series {
  past: boolean;
}

/**
 * Today's calendar date in Mazatlán, YYYY-MM-DD. Callers must sit inside a
 * `use cache` scope: Cache Components rejects an unguarded current time.
 */
export function todayInMazatlan(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: siteConfig.timeZone }).format(new Date());
}

export function datedSchedule(today: string): DatedSeries[] {
  return schedule.map((series) => ({
    ...series,
    past: series.dates[series.dates.length - 1] < today,
  }));
}

// Dates are plain calendar days, so format them in UTC: formatting in the
// server's zone could shift a date-only value by a day.
const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDay(date: string): string {
  return dayFormat.format(new Date(`${date}T00:00:00Z`));
}

export function formatRange(dates: string[]): string {
  const first = formatDay(dates[0]);
  return dates.length === 1 ? first : `${first} – ${formatDay(dates[dates.length - 1])}`;
}

export function monthKey(date: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}
