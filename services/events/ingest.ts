import "server-only";

import { createHash } from "node:crypto";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { INGEST_MODEL } from "@/services/ai/client";
import { extractEvent } from "@/services/ai/extract-event";
import type { ExtractedEvent } from "@/services/ai/schemas";
import { filterNewItems } from "@/services/scraping/dedupe";
import { scrapeSource } from "@/services/scraping/fetch-source";
import type { ScrapedItem } from "@/services/scraping/types";
import type { EventRow, SourceRow } from "@/types";

export interface IngestReport {
  sourcesProcessed: number;
  scraped: number;
  newAfterDedupe: number;
  extracted: number;
  rejectedByValidation: number;
  inserted: number;
  errors: string[];
}

const MIN_CONFIDENCE = 0.5;
/** Anything further out than this is almost always a misparsed year. */
const MAX_FUTURE_DAYS = 400;

/**
 * Code-level gate between the LLM and the database. The model is untrusted here:
 * it can be confidently wrong about dates, and it has no idea whether a URL is
 * real. Nothing that fails this reaches the review queue.
 */
function validate(
  extracted: ExtractedEvent,
  now: Date,
): { ok: true; startsAt: Date; endsAt: Date | null } | { ok: false; reason: string } {
  if (!extracted.is_event) return { ok: false, reason: "not an event" };
  if (extracted.confidence < MIN_CONFIDENCE) {
    return { ok: false, reason: `low confidence (${extracted.confidence})` };
  }
  if (!extracted.title.trim()) return { ok: false, reason: "empty title" };
  if (!extracted.description_en.trim()) return { ok: false, reason: "empty description" };

  const startsAt = new Date(extracted.starts_at);
  if (Number.isNaN(startsAt.getTime())) return { ok: false, reason: "unparseable starts_at" };
  if (startsAt.getTime() < now.getTime()) return { ok: false, reason: "starts in the past" };

  const horizon = new Date(now.getTime() + MAX_FUTURE_DAYS * 86_400_000);
  if (startsAt > horizon) return { ok: false, reason: "starts implausibly far in the future" };

  let endsAt: Date | null = null;
  if (extracted.ends_at) {
    const parsed = new Date(extracted.ends_at);
    if (!Number.isNaN(parsed.getTime()) && parsed >= startsAt) endsAt = parsed;
  }

  if (extracted.ticket_url && !/^https?:\/\//i.test(extracted.ticket_url)) {
    return { ok: false, reason: "ticket_url is not an absolute http(s) URL" };
  }

  return { ok: true, startsAt, endsAt };
}

/** Slug collisions are possible across years/venues, so suffix with a URL hash. */
function buildSlug(title: string, sourceUrl: string, startsAt: Date): string {
  const suffix = createHash("sha1").update(sourceUrl).digest("hex").slice(0, 6);
  const datePart = startsAt.toISOString().slice(0, 10);
  return `${slugify(title)}-${datePart}-${suffix}`;
}

function toInsertRow(
  item: ScrapedItem,
  extracted: ExtractedEvent,
  startsAt: Date,
  endsAt: Date | null,
): Partial<EventRow> {
  return {
    slug: buildSlug(extracted.title, item.sourceUrl, startsAt),
    title: extracted.title.trim(),
    description_en: extracted.description_en.trim(),
    // Audit copy. Column-level grants keep this away from anon clients.
    description_original: item.rawText,
    category: extracted.category,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt?.toISOString() ?? null,
    venue_name: extracted.venue_name,
    address: extracted.address,
    price_info: extracted.price_info,
    image_url: item.imageUrl ?? null,
    ticket_url: extracted.ticket_url,
    source_id: item.sourceId,
    source_name: item.sourceName,
    source_url: item.sourceUrl,
    ai_generated: true,
    ai_model: INGEST_MODEL,
    // The whole point of the pipeline: nothing ever lands published.
    status: "pending_review",
  };
}

/**
 * One full ingest run: active sources -> scrape -> dedupe -> LLM -> validate ->
 * insert as pending_review. Publishing stays a human action in /admin/review.
 */
export async function runEventIngest(options?: { sourceId?: string }): Promise<IngestReport> {
  const supabase = getAdminSupabase();
  const now = new Date();
  const report: IngestReport = {
    sourcesProcessed: 0,
    scraped: 0,
    newAfterDedupe: 0,
    extracted: 0,
    rejectedByValidation: 0,
    inserted: 0,
    errors: [],
  };

  let sourceQuery = supabase.from("sources").select("*").eq("is_active", true);
  if (options?.sourceId) sourceQuery = sourceQuery.eq("id", options.sourceId);

  const { data: sources, error: sourcesError } = await sourceQuery;
  if (sourcesError) {
    report.errors.push(`source lookup failed: ${sourcesError.message}`);
    return report;
  }

  for (const source of (sources ?? []) as SourceRow[]) {
    report.sourcesProcessed++;

    const scraped = await scrapeSource(source);
    report.scraped += scraped.length;

    const fresh = await filterNewItems(scraped);
    report.newAfterDedupe += fresh.length;

    const rows: Partial<EventRow>[] = [];
    for (const item of fresh) {
      const extracted = await extractEvent(item, now);
      if (!extracted) continue;
      report.extracted++;

      const verdict = validate(extracted, now);
      if (!verdict.ok) {
        report.rejectedByValidation++;
        console.info(`[ingest] dropped ${item.sourceUrl}: ${verdict.reason}`);
        continue;
      }
      rows.push(toInsertRow(item, extracted, verdict.startsAt, verdict.endsAt));
    }

    if (rows.length > 0) {
      // ignoreDuplicates handles a source_url that appeared between dedupe and insert.
      const { data, error } = await supabase
        .from("events")
        .upsert(rows, { onConflict: "source_url", ignoreDuplicates: true })
        .select("id");

      if (error) {
        report.errors.push(`insert failed for ${source.name}: ${error.message}`);
      } else {
        report.inserted += data?.length ?? 0;
      }
    }

    await supabase
      .from("sources")
      .update({ last_scraped_at: now.toISOString() })
      .eq("id", source.id);
  }

  return report;
}
