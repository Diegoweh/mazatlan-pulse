import { z } from "zod";

/**
 * Shape of `sources.scrape_config`. Parsed defensively — the column is jsonb and
 * is edited by hand, so a bad config should skip one source, not crash the run.
 */
export const scrapeConfigSchema = z.object({
  listSelector: z.string(),
  titleSelector: z.string().optional(),
  linkSelector: z.string().optional(),
  dateSelector: z.string().optional(),
  imageSelector: z.string().optional(),
  /** Appended to base_url for pages 2..n, `{page}` is substituted. */
  pagePattern: z.string().optional(),
  maxPages: z.number().int().min(1).max(20).default(1),
  timezone: z.string().default("America/Mazatlan"),
  userAgent: z.string().optional(),
});

export type ScrapeConfig = z.infer<typeof scrapeConfigSchema>;

/** One raw listing lifted off a source page. No interpretation yet. */
export interface ScrapedItem {
  sourceId: string;
  sourceName: string;
  /** Canonical URL of the individual listing. Also the dedupe key. */
  sourceUrl: string;
  /** Verbatim text as scraped. Stored in description_original for audit only. */
  rawText: string;
  rawTitle?: string;
  rawDate?: string;
  imageUrl?: string;
}
