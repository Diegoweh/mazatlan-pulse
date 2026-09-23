"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { BUS_ROUTES_CACHE_TAG } from "@/services/transport/queries";

export interface SaveResult {
  ok: boolean;
  message: string;
  slug?: string;
}

// Generous box around Sinaloa rather than the full -90..90 / -180..180 range.
// This is a Mazatlán-only site, so the wide range would let 0,0 (an empty form
// field coerced to a number) and swapped lat/lng through as valid data.
const REGION = { minLat: 20, maxLat: 27, minLng: -110, maxLng: -104 };

const stopSchema = z.object({
  name: z.string().min(1, "Stop name is required"),
  lat: z
    .number()
    .min(REGION.minLat, "Latitude is outside Sinaloa — check for a typo or swapped coordinates")
    .max(REGION.maxLat, "Latitude is outside Sinaloa — check for a typo or swapped coordinates"),
  lng: z
    .number()
    .min(REGION.minLng, "Longitude is outside Sinaloa — check for a typo or swapped coordinates")
    .max(REGION.maxLng, "Longitude is outside Sinaloa — check for a typo or swapped coordinates"),
  order: z.number().int().min(1),
});

/**
 * Server-side validation, not just client-side. These actions run with the
 * service_role key, which bypasses RLS entirely — the schema below is the only
 * thing standing between a malformed payload and the table.
 */
const busRouteSchema = z.object({
  id: z.uuid().optional(),
  slug: z.string().optional(),
  route_name: z.string().min(2, "Route name is required"),
  route_number: z.string().nullable(),
  color_hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Colour must be a hex value like #1D9BF0")
    .nullable(),
  fare_mxn: z.number().min(0).max(9999).nullable(),
  fare_notes: z.string().nullable(),
  key_stops: z.array(stopSchema),
  route_path: z.array(
    z.tuple([
      z.number().min(REGION.minLat).max(REGION.maxLat),
      z.number().min(REGION.minLng).max(REGION.maxLng),
    ]),
  ),
  tourist_tips_en: z.string().nullable(),
  operating_hours: z.string().nullable(),
  frequency_notes: z.string().nullable(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
  /** Set only when the admin confirms they checked the route in person. */
  mark_verified: z.boolean(),
});

export type BusRouteInput = z.input<typeof busRouteSchema>;

export async function saveBusRoute(input: BusRouteInput): Promise<SaveResult> {
  if (!(await requireAdmin())) return { ok: false, message: "Not authorized." };

  const parsed = busRouteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: z.prettifyError(parsed.error) };
  }
  const { id, mark_verified, slug, ...fields } = parsed.data;

  // Stop order is the contract the public page and JSON-LD sort on — normalize it
  // here rather than trusting whatever the form sent.
  const key_stops = [...fields.key_stops]
    .sort((a, b) => a.order - b.order)
    .map((stop, index) => ({ ...stop, order: index + 1 }));

  const row = {
    ...fields,
    key_stops,
    slug: slug?.trim() ? slugify(slug) : slugify(fields.route_name),
    ...(mark_verified ? { last_verified_at: new Date().toISOString() } : {}),
  };

  const supabase = getAdminSupabase();
  const query = id
    ? supabase.from("bus_routes").update(row).eq("id", id)
    : supabase.from("bus_routes").insert(row);

  const { data, error } = await query.select("slug").maybeSingle();

  if (error) {
    const message =
      error.code === "23505"
        ? `Slug "${row.slug}" is already taken. Give the route a different name or slug.`
        : error.message;
    return { ok: false, message };
  }

  updateTag(BUS_ROUTES_CACHE_TAG);
  return { ok: true, message: "Saved.", slug: data?.slug ?? row.slug };
}

export async function setBusRouteActive(id: string, isActive: boolean): Promise<SaveResult> {
  if (!(await requireAdmin())) return { ok: false, message: "Not authorized." };

  const supabase = getAdminSupabase();
  const { error } = await supabase.from("bus_routes").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, message: error.message };

  updateTag(BUS_ROUTES_CACHE_TAG);
  return { ok: true, message: isActive ? "Published." : "Unpublished." };
}

export async function deleteBusRoute(id: string): Promise<SaveResult> {
  if (!(await requireAdmin())) return { ok: false, message: "Not authorized." };

  const supabase = getAdminSupabase();
  const { error } = await supabase.from("bus_routes").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };

  updateTag(BUS_ROUTES_CACHE_TAG);
  return { ok: true, message: "Deleted." };
}
