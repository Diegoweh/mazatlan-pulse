"use server";

import { createHash } from "node:crypto";

import { updateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { INGEST_MODEL } from "@/services/ai/client";
import { extractEvent } from "@/services/ai/extract-event";
import { EVENTS_CACHE_TAG } from "@/services/events/queries";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const EVENT_CATEGORIES = [
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

const eventSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().min(3, "Title is required"),
  description_en: z.string().nullable(),
  /** Raw pasted text. Audit only — never shown publicly. */
  description_original: z.string().nullable(),
  category: z.enum(EVENT_CATEGORIES),
  starts_at: z.iso.datetime({ offset: true }),
  ends_at: z.iso.datetime({ offset: true }).nullable(),
  venue_name: z.string().nullable(),
  address: z.string().nullable(),
  price_info: z.string().nullable(),
  image_url: z.string().nullable(),
  ticket_url: z.string().nullable(),
  source_name: z.string().min(2, "Where did this come from? Name the page or venue."),
  source_url: z.string().url("Source URL must be a full URL"),
  ai_generated: z.boolean(),
  publish: z.boolean(),
});

export type EventInput = z.input<typeof eventSchema>;

export interface DraftResult {
  ok: boolean;
  message: string;
  draft?: {
    title: string;
    description_en: string;
    category: (typeof EVENT_CATEGORIES)[number];
    starts_at: string;
    ends_at: string | null;
    venue_name: string | null;
    address: string | null;
    price_info: string | null;
    ticket_url: string | null;
    confidence: number;
  };
}

/**
 * Turns pasted text into a draft. A person reads a page they're entitled to
 * read, copies the text, and we publish a summary that links back — no
 * automated access to anyone's platform.
 *
 * Nothing is written to the database here: the reviewer still has to save.
 */
export async function draftFromText(
  rawText: string,
  sourceUrl: string,
  sourceName: string,
): Promise<DraftResult> {
  if (!(await requireAdmin())) return { ok: false, message: "Not authorized." };
  if (rawText.trim().length < 20) {
    return { ok: false, message: "Paste a bit more text — there's not enough to work with." };
  }

  const extracted = await extractEvent(
    {
      sourceId: "",
      sourceName: sourceName.trim() || "Pasted",
      sourceUrl: sourceUrl.trim() || "https://example.invalid/pasted",
      rawText: rawText.trim(),
    },
    new Date(),
  );

  if (!extracted) {
    return { ok: false, message: "Extraction failed. Fill the form in by hand." };
  }
  if (!extracted.is_event) {
    return { ok: false, message: "That doesn't read like an event listing." };
  }

  // Same guard the ingest pipeline uses: the listing's own URL is not a ticket link.
  const ticketUrl =
    extracted.ticket_url &&
    /^https?:\/\//i.test(extracted.ticket_url) &&
    extracted.ticket_url.replace(/\/+$/, "") !== sourceUrl.trim().replace(/\/+$/, "")
      ? extracted.ticket_url
      : null;

  return {
    ok: true,
    message:
      extracted.confidence < 0.6
        ? `Drafted, but confidence is low (${extracted.confidence}). Check the date and venue.`
        : "Drafted. Check everything before saving.",
    draft: { ...extracted, ticket_url: ticketUrl },
  };
}

export async function saveEvent(input: EventInput): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, message: "Not authorized." };

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: z.prettifyError(parsed.error) };

  const { id, publish, ...fields } = parsed.data;

  const supabase = getAdminSupabase();
  const reviewed = {
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase
      .from("events")
      .update({
        ...fields,
        status: publish ? "published" : "pending_review",
        // The CHECK constraint refuses a published row without a reviewer.
        ...(publish ? reviewed : {}),
      })
      .eq("id", id);
    if (error) return { ok: false, message: error.message };
  } else {
    // Slug collisions are real across seasons, so suffix with a hash of the source.
    const startsAt = new Date(fields.starts_at);
    const suffix = createHash("sha1").update(fields.source_url).digest("hex").slice(0, 6);
    const slug = `${slugify(fields.title)}-${startsAt.toISOString().slice(0, 10)}-${suffix}`;

    const { error } = await supabase.from("events").insert({
      ...fields,
      slug,
      ai_model: fields.ai_generated ? INGEST_MODEL : null,
      status: publish ? "published" : "pending_review",
      ...(publish ? reviewed : {}),
    });
    if (error) {
      return {
        ok: false,
        message:
          error.code === "23505"
            ? "An event with that source URL already exists."
            : error.message,
      };
    }
  }

  updateTag(EVENTS_CACHE_TAG);
  return { ok: true, message: publish ? "Published." : "Saved as a draft." };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, message: "Not authorized." };

  const supabase = getAdminSupabase();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };

  updateTag(EVENTS_CACHE_TAG);
  return { ok: true, message: "Deleted." };
}
