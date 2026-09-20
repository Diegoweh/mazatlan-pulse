"use server";

import { updateTag } from "next/cache";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { EVENTS_CACHE_TAG } from "@/services/events/queries";

export interface ActionResult {
  ok: boolean;
  message: string;
}

/**
 * The gate the whole pipeline exists for: an AI-extracted event only becomes
 * public when a human clicks approve.
 */
export async function approveEvent(eventId: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, message: "Not authorized." };

  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from("events")
    .update({
      status: "published",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("status", "pending_review");

  if (error) return { ok: false, message: error.message };

  // updateTag (not revalidateTag): the reviewer should see the published event
  // immediately in the same request, not on the next one.
  updateTag(EVENTS_CACHE_TAG);
  return { ok: true, message: "Published." };
}

export async function rejectEvent(eventId: string, notes?: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, message: "Not authorized." };

  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from("events")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes ?? null,
    })
    .eq("id", eventId)
    .eq("status", "pending_review");

  if (error) return { ok: false, message: error.message };

  // Rejected rows keep their source_url, so dedupe won't re-propose them.
  return { ok: true, message: "Rejected." };
}

/** Edits the reviewer makes before approving (fixing a date the model got wrong). */
export async function updateEventDraft(
  eventId: string,
  patch: { title?: string; description_en?: string; starts_at?: string; venue_name?: string },
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { ok: false, message: "Not authorized." };

  const supabase = getAdminSupabase();
  const { error } = await supabase.from("events").update(patch).eq("id", eventId);

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Saved." };
}
