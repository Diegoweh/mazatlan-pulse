import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";

import { STADIUM } from "@/content/baseball";

import { datedSchedule, formatRange, todayInMazatlan } from "./schedule";

/**
 * Small teaser for pages outside /baseball. Renders nothing once the listed
 * schedule has run out, so it never advertises a finished season.
 */
export async function NextHomeSeries({ className }: { className?: string }) {
  "use cache";
  cacheLife("hours");

  const next = datedSchedule(todayInMazatlan()).find((item) => item.home && !item.past);
  if (!next) return null;

  return (
    <Link
      href="/baseball"
      className={`card card-interactive group flex min-w-0 items-center gap-4 p-4 ${className ?? ""}`}
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-teal-wash">
        <Image
          src="/images/teodoro-mariscal-aerial.jpg"
          alt=""
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow">Baseball season is on</p>
        <p className="mt-1 font-semibold text-navy group-hover:text-teal-ink">
          Venados vs. {next.opponent}, {formatRange(next.dates)}
        </p>
        <p className="text-xs text-muted">{STADIUM} · Full schedule →</p>
      </div>
    </Link>
  );
}
