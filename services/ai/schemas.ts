import { z } from "zod";

export const EVENT_CATEGORIES = [
  "music",
  "nightlife",
  "festival",
  "sports",
  "food_drink",
  "arts_culture",
  "family",
  "community",
  "other",
] as const;

/**
 * Structured output contract for event extraction.
 *
 * Deliberately conservative: every uncertain field is nullable so the model can
 * say "not stated" instead of inventing a venue or a price. Anything null here
 * surfaces in the review queue for a human to fill in.
 */
export const extractedEventSchema = z.object({
  is_event: z
    .boolean()
    .describe("False if the text is navigation, an ad, or otherwise not a real event listing."),
  title: z.string().describe("Event name in English. Keep proper nouns in Spanish."),
  description_en: z
    .string()
    .describe(
      "2-4 sentence original English summary written for a US/Canadian visitor. A summary in your own words, never a translation of the source text sentence by sentence.",
    ),
  category: z.enum(EVENT_CATEGORIES),
  starts_at: z
    .string()
    .describe("ISO 8601 with offset, in America/Mazatlan (-07:00). Example: 2026-10-04T21:00:00-07:00"),
  ends_at: z.string().nullable().describe("ISO 8601 with offset, or null if not stated."),
  venue_name: z.string().nullable(),
  address: z.string().nullable(),
  price_info: z.string().nullable().describe("Short English phrase, e.g. 'Free' or 'From 350 MXN'."),
  ticket_url: z.string().nullable(),
  confidence: z
    .number()
    .describe("0-1. How certain you are that the date and venue are correct."),
});

export type ExtractedEvent = z.infer<typeof extractedEventSchema>;
