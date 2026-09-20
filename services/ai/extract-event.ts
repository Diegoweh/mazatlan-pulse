import "server-only";

import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

import { INGEST_MODEL, STRUCTURED_OUTPUTS_BETA, getAnthropic } from "@/services/ai/client";
import { extractedEventSchema, type ExtractedEvent } from "@/services/ai/schemas";
import type { ScrapedItem } from "@/services/scraping/types";

const SYSTEM_PROMPT = `You extract event data for an English-language guide to Mazatlán, Sinaloa, Mexico, written for US and Canadian visitors.

Rules:
- Return only what the source text supports. Never invent a venue, date, price or URL.
- description_en must be your own short summary written for a visitor, not a sentence-by-sentence translation and never a verbatim copy of the source.
- All datetimes are America/Mazatlan (UTC-07:00, no DST). Resolve relative dates ("this Friday") against the provided reference date.
- If the text is not an actual event listing, set is_event to false and leave the other fields as best-effort placeholders.
- Set confidence below 0.6 whenever the date or venue is ambiguous.`;

export async function extractEvent(
  item: ScrapedItem,
  referenceDate: Date = new Date(),
): Promise<ExtractedEvent | null> {
  const client = getAnthropic();

  const userContent = [
    `Reference date (America/Mazatlan): ${referenceDate.toISOString()}`,
    `Source: ${item.sourceName}`,
    `Listing URL: ${item.sourceUrl}`,
    item.rawTitle ? `Scraped title: ${item.rawTitle}` : null,
    item.rawDate ? `Scraped date text: ${item.rawDate}` : null,
    "",
    "Listing text:",
    item.rawText,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const message = await client.beta.messages.parse({
      model: INGEST_MODEL,
      max_tokens: 2048,
      betas: [STRUCTURED_OUTPUTS_BETA],
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      output_format: betaZodOutputFormat(extractedEventSchema),
    });

    if (message.stop_reason === "refusal") {
      console.warn(`[ai] refused: ${item.sourceUrl}`);
      return null;
    }
    // `parsed_output` is null when the response didn't satisfy the schema.
    return message.parsed_output ?? null;
  } catch (error) {
    console.error(`[ai] extraction failed for ${item.sourceUrl}:`, error);
    return null;
  }
}
