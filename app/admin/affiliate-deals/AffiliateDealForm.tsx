"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { allowedImageHosts } from "@/lib/images";
import type { AffiliateDealRow } from "@/types";

import { deleteAffiliateDeal, saveAffiliateDeal } from "./actions";

const FIELD =
  "w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25";
const LABEL = "block text-sm font-medium mb-1";

const CATEGORIES = [
  ["tour", "Tour"],
  ["activity", "Activity"],
  ["hotel", "Hotel"],
  ["car_rental", "Car rental"],
  ["airport_transfer", "Airport transfer"],
  ["insurance", "Insurance"],
  ["other", "Other"],
] as const;

/** Suggestions only — the field stays free text for partners we add later. */
const PROVIDERS = ["viator", "getyourguide", "tripadvisor", "booking", "discovercars"];

export function AffiliateDealForm({ deal }: { deal: AffiliateDealRow | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function onSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = new FormData(formEvent.currentTarget);
    const text = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" && value.trim() ? value.trim() : null;
    };
    const num = (name: string) => {
      const value = text(name);
      return value === null ? null : Number(value);
    };

    startTransition(async () => {
      const result = await saveAffiliateDeal({
        id: deal?.id,
        slug: text("slug") ?? undefined,
        title: form.get("title") as string,
        category: form.get("category") as AffiliateDealRow["category"],
        provider: form.get("provider") as string,
        affiliate_url: form.get("affiliate_url") as string,
        estimated_commission_pct: num("estimated_commission_pct"),
        price_from_usd: num("price_from_usd"),
        image_url: text("image_url"),
        location_name: text("location_name"),
        short_description_en: text("short_description_en"),
        is_featured: form.get("is_featured") === "on",
        is_active: form.get("is_active") === "on",
        sort_order: num("sort_order") ?? 0,
      });

      setIsError(!result.ok);
      setMessage(result.message);
      if (result.ok && !deal) router.push("/admin/affiliate-deals");
      else if (result.ok) router.refresh();
    });
  }

  function onDelete() {
    if (!deal) return;
    startTransition(async () => {
      const result = await deleteAffiliateDeal(deal.id);
      if (result.ok) router.push("/admin/affiliate-deals");
      else {
        setIsError(true);
        setMessage(result.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className={LABEL} htmlFor="title">
          Title *
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={deal?.title ?? ""}
          className={FIELD}
          placeholder="Old Town Mazatlán Food Walking Tour"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="category">
            Category *
          </label>
          <select
            id="category"
            name="category"
            defaultValue={deal?.category ?? "tour"}
            className={FIELD}
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="provider">
            Provider *
          </label>
          <input
            id="provider"
            name="provider"
            required
            list="provider-options"
            defaultValue={deal?.provider ?? ""}
            className={FIELD}
          />
          <datalist id="provider-options">
            {PROVIDERS.map((provider) => (
              <option key={provider} value={provider} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="affiliate_url">
          Affiliate URL * (https, with your tracking parameters)
        </label>
        <input
          id="affiliate_url"
          name="affiliate_url"
          type="url"
          required
          defaultValue={deal?.affiliate_url ?? ""}
          className={FIELD}
          placeholder="https://www.viator.com/tours/...?pid=..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={LABEL} htmlFor="estimated_commission_pct">
            Commission %
          </label>
          <input
            id="estimated_commission_pct"
            name="estimated_commission_pct"
            type="number"
            step="0.5"
            min="0"
            max="100"
            defaultValue={deal?.estimated_commission_pct ?? ""}
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="price_from_usd">
            Price from (USD)
          </label>
          <input
            id="price_from_usd"
            name="price_from_usd"
            type="number"
            step="1"
            min="0"
            defaultValue={deal?.price_from_usd ?? ""}
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="sort_order">
            Sort order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            step="10"
            min="0"
            defaultValue={deal?.sort_order ?? 0}
            className={FIELD}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="location_name">
            Location
          </label>
          <input
            id="location_name"
            name="location_name"
            defaultValue={deal?.location_name ?? ""}
            className={FIELD}
            placeholder="Centro Histórico"
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="slug">
            Slug (blank = from title)
          </label>
          <input id="slug" name="slug" defaultValue={deal?.slug ?? ""} className={FIELD} />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="image_url">
          Image URL
        </label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          defaultValue={deal?.image_url ?? ""}
          className={FIELD}
        />
        <p className="mt-1 text-xs text-black/50 dark:text-white/50">
          Must be on a configured host: {allowedImageHosts().join(", ")}. Anything else is
          rejected on save — next/image would throw on the public page.
        </p>
      </div>

      <div>
        <label className={LABEL} htmlFor="short_description_en">
          Short description (English, shown on the card)
        </label>
        <textarea
          id="short_description_en"
          name="short_description_en"
          rows={3}
          defaultValue={deal?.short_description_en ?? ""}
          className={FIELD}
        />
      </div>

      <div className="space-y-2 rounded-lg border border-black/10 p-4 dark:border-white/15">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={deal?.is_active ?? false} />
          Active (visible on the public site)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" defaultChecked={deal?.is_featured ?? false} />
          Featured (homepage placement)
        </label>
        {deal ? (
          <p className="text-xs text-black/50 dark:text-white/50">
            {deal.click_count} click{deal.click_count === 1 ? "" : "s"} recorded.
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : deal ? "Save changes" : "Create deal"}
        </button>
        {deal ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="text-sm text-red-600 underline disabled:opacity-50"
          >
            Delete
          </button>
        ) : null}
        {message ? (
          <span
            className={`whitespace-pre-line text-sm ${
              isError ? "text-red-600" : "text-black/60 dark:text-white/60"
            }`}
          >
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
