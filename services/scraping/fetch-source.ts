import * as cheerio from "cheerio";

import { siteConfig } from "@/lib/site";
import { scrapeConfigSchema, type ScrapedItem } from "@/services/scraping/types";
import type { SourceRow } from "@/types";

const USER_AGENT = `MazatlanPulseBot/0.1 (+${siteConfig.url}/robots.txt)`;

function absolutize(href: string | undefined, baseUrl: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

/**
 * Pulls raw listings off one source. Cheerio only — no headless browser.
 * If a source turns out to be client-rendered, give that source a Playwright
 * fetcher behind this same return type rather than changing callers.
 */
export async function scrapeSource(source: SourceRow): Promise<ScrapedItem[]> {
  const parsed = scrapeConfigSchema.safeParse(source.scrape_config);
  if (!parsed.success) {
    console.error(`[scrape] bad scrape_config for "${source.name}":`, parsed.error.message);
    return [];
  }
  const config = parsed.data;

  const items: ScrapedItem[] = [];
  const seenUrls = new Set<string>();

  for (let page = 1; page <= config.maxPages; page++) {
    const pageUrl =
      page === 1 || !config.pagePattern
        ? source.base_url
        : new URL(config.pagePattern.replace("{page}", String(page)), source.base_url).toString();

    let html: string;
    try {
      const response = await fetch(pageUrl, {
        headers: { "user-agent": config.userAgent ?? USER_AGENT },
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      });
      if (!response.ok) {
        console.error(`[scrape] ${pageUrl} returned ${response.status}`);
        break;
      }
      html = await response.text();
    } catch (error) {
      console.error(`[scrape] fetch failed for ${pageUrl}:`, error);
      break;
    }

    const $ = cheerio.load(html);
    const nodes = $(config.listSelector);
    if (nodes.length === 0) break;

    nodes.each((_index, element) => {
      const node = $(element);
      const href = config.linkSelector
        ? node.find(config.linkSelector).attr("href")
        : node.find("a").first().attr("href");

      const sourceUrl = absolutize(href, source.base_url);
      if (!sourceUrl || seenUrls.has(sourceUrl)) return;
      seenUrls.add(sourceUrl);

      const rawText = node.text().replace(/\s+/g, " ").trim();
      if (!rawText) return;

      items.push({
        sourceId: source.id,
        sourceName: source.name,
        sourceUrl,
        rawText,
        rawTitle: config.titleSelector ? node.find(config.titleSelector).text().trim() : undefined,
        rawDate: config.dateSelector ? node.find(config.dateSelector).text().trim() : undefined,
        imageUrl:
          absolutize(
            config.imageSelector
              ? node.find(config.imageSelector).attr("src")
              : node.find("img").first().attr("src"),
            source.base_url,
          ) ?? undefined,
      });
    });
  }

  return items;
}
