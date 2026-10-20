import { cacheLife } from "next/cache";

import { JsonLd } from "@/components/ui/JsonLd";
import { STADIUM } from "@/content/baseball";
import { homeGameSchema } from "@/lib/schema-org";
import { cn } from "@/lib/utils";

import { datedSchedule, formatRange, monthKey, todayInMazatlan } from "./schedule";

/**
 * Season schedule, grouped by month. Cached for hours rather than built once:
 * "past" and "today" move with the calendar, and a once-per-deploy build would
 * leave last week's series looking upcoming.
 */
export async function BaseballSchedule() {
  "use cache";
  cacheLife("hours");

  const today = todayInMazatlan();
  const series = datedSchedule(today);

  const months = new Map<string, typeof series>();
  for (const item of series) {
    const key = monthKey(item.dates[0]);
    months.set(key, [...(months.get(key) ?? []), item]);
  }

  // Only upcoming home games: those are the ones a visitor can attend here, and
  // structured data for past games is noise.
  const homeGames = series
    .filter((item) => item.home)
    .flatMap((item) =>
      item.dates
        .filter((date) => date >= today)
        .map((date) => homeGameSchema({ date, opponent: item.opponent, city: item.city, stadium: STADIUM })),
    );

  return (
    <div className="space-y-10">
      {homeGames.map((schema) => (
        <JsonLd key={String(schema.startDate)} schema={schema} />
      ))}

      {[...months].map(([month, items]) => (
        <section key={month} aria-labelledby={`month-${month}`} className="space-y-3">
          <h3 id={`month-${month}`} className="font-display text-xl text-navy">
            {month}
          </h3>
          <ol className="divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
            {items.map((item) => {
              const now = item.dates.includes(today);
              return (
                <li
                  key={item.dates[0]}
                  className={cn(
                    "flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3",
                    item.past && "opacity-50",
                    now && "bg-coral-wash",
                  )}
                >
                  <span className="w-full text-sm font-semibold text-navy sm:w-48">
                    {formatRange(item.dates)}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-ink">
                    {item.home ? "vs." : "at"} <strong className="font-semibold">{item.opponent}</strong>{" "}
                    <span className="text-muted">({item.city})</span>
                    {item.note ? (
                      <span className="ml-2 text-xs font-semibold text-teal-ink">{item.note}</span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      item.home ? "bg-coral text-ink" : "border border-line text-muted",
                    )}
                  >
                    {now ? "Today · " : ""}
                    {item.home ? "Home" : "Away"}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
