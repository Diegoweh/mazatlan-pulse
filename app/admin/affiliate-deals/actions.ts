"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { allowedImageHosts, isAllowedImageUrl } from "@/lib/images";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { AFFILIATE_CACHE_TAG } from "@/services/affiliates/queries";

export interface SaveResult {
  ok: boolean;
  message: string;
}

const AFFILIATE_CATEGORIES = [
  "tour",
  "activity",
  "hotel",
  "car_rental",
  "airport_transfer",
  "insurance",
  "other",
] as const;

const dealSchema = z.object({
  id: z.uuid().optional(),
  slug: z.string().optional(),
  title: z.string().min(3, "Title is required"),
  category: z.enum(AFFILIATE_CATEGORIES),
  provider: z.string().min(2, "Provider is required"),
  affiliate_url: z
    .string()
    .url("Affiliate URL must be a full URL")
    // http links leak the referrer through a redirect and trip mixed-content
    // blocking, which silently costs attribution.
    .refine((value) => value.startsWith("https://"), "Affiliate URL must use https"),
  estimated_commission_pct: z.number().min(0).max(100).nullable(),
  price_from_usd: z.number().min(0).max(100000).nullable(),
  image_url: z
    .string()
    .nullable()
    .refine(
      (value) => value === null || isAllowedImageUrl(value),
      `Image host is not configured. next/image will throw at request time. Allowed: ${allowedImageHosts().join(", ")}`,
    ),
  location_name: z.string().nullable(),
  short_description_en: z.string().nullable(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

export type AffiliateDealInput = z.input<typeof dealSchema>;

export async function saveAffiliateDeal(input: AffiliateDealInput): Promise<SaveResult> {
  if (!(await requireAdmin())) return { ok: false, message: "Not authorized." };

  const parsed = dealSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: z.prettifyError(parsed.error) };

  const { id, slug, ...fields } = parsed.data;
  const row = {
    ...fields,
    slug: slug?.trim() ? slugify(slug) : slugify(fields.title),
  };

  const supabase = getAdminSupabase();
  // click_count is never written here — it belongs to the public RPC.
  const { error } = id
    ? await supabase.from("affiliate_deals").update(row).eq("id", id)
    : await supabase.from("affiliate_deals").insert(row);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? `Slug "${row.slug}" is already taken. Change the title or set a different slug.`
          : error.message,
    };
  }

  updateTag(AFFILIATE_CACHE_TAG);
  return { ok: true, message: "Saved." };
}

export async function setDealActive(id: string, isActive: boolean): Promise<SaveResult> {
  if (!(await requireAdmin())) return { ok: false, message: "Not authorized." };

  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from("affiliate_deals")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };

  updateTag(AFFILIATE_CACHE_TAG);
  return { ok: true, message: isActive ? "Live." : "Paused." };
}

export async function deleteAffiliateDeal(id: string): Promise<SaveResult> {
  if (!(await requireAdmin())) return { ok: false, message: "Not authorized." };

  const supabase = getAdminSupabase();
  const { error } = await supabase.from("affiliate_deals").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };

  updateTag(AFFILIATE_CACHE_TAG);
  return { ok: true, message: "Deleted." };
}
