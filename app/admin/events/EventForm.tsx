"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { describeLocal, fromLocalInput, toLocalInput } from "@/lib/time";
import { siteConfig } from "@/lib/site";
import type { EventRow } from "@/types";

import { deleteEvent, draftFromText, saveEvent } from "./actions";

const FIELD =
  "w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 text-sm";
const LABEL = "block text-sm font-medium mb-1";

const CATEGORIES = [
  ["music", "Live music"],
  ["nightlife", "Nightlife"],
  ["festival", "Festival"],
  ["sports", "Sports"],
  ["food_drink", "Food & drink"],
  ["arts_culture", "Arts & culture"],
  ["family", "Family"],
  ["community", "Community"],
  ["other", "Other"],
] as const;

type Draft = {
  title: string;
  description_en: string;
  category: EventRow["category"];
  starts_at: string;
  ends_at: string;
  venue_name: string | null;
  address: string | null;
  price_info: string | null;
  ticket_url: string | null;
};

export function EventForm({ event }: { event: EventRow | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Pasted source text. Kept in state because it's both the AI input and the
  // audit copy saved to description_original.
  const [rawText, setRawText] = useState(event?.description_original ?? "");
  const [sourceUrl, setSourceUrl] = useState(event?.source_url ?? "");
  const [sourceName, setSourceName] = useState(event?.source_name ?? "");
  const [aiGenerated, setAiGenerated] = useState(event?.ai_generated ?? false);

  // Controlled so the AI draft can fill them; still fully editable by hand.
  const [draft, setDraft] = useState<Draft>({
    title: event?.title ?? "",
    description_en: event?.description_en ?? "",
    category: event?.category ?? "music",
    starts_at: toLocalInput(event?.starts_at ?? null),
    ends_at: toLocalInput(event?.ends_at ?? null),
    venue_name: event?.venue_name ?? "",
    address: event?.address ?? "",
    price_info: event?.price_info ?? "",
    ticket_url: event?.ticket_url ?? "",
  });

  /**
   * True when the public description is just the pasted text. Catches the case
   * where the editor pastes a post and saves without drafting — the site would
   * publish the original Spanish instead of an English summary, which is both
   * the wrong language and a verbatim copy of someone else's post.
   */
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
      .trim();
  const descriptionIsOriginal =
    draft.description_en.trim().length > 0 &&
    rawText.trim().length > 0 &&
    normalize(rawText).includes(normalize(draft.description_en));

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function onDraft() {
    startTransition(async () => {
      const result = await draftFromText(rawText, sourceUrl, sourceName);
      setIsError(!result.ok);
      setMessage(result.message);
      if (!result.draft) return;

      const d = result.draft;
      setDraft({
        title: d.title,
        description_en: d.description_en,
        category: d.category,
        starts_at: toLocalInput(d.starts_at),
        ends_at: toLocalInput(d.ends_at),
        venue_name: d.venue_name ?? "",
        address: d.address ?? "",
        price_info: d.price_info ?? "",
        ticket_url: d.ticket_url ?? "",
      });
      setAiGenerated(true);
    });
  }

  function submit(publish: boolean) {
    const startsAt = fromLocalInput(draft.starts_at);
    if (!startsAt) {
      setIsError(true);
      setMessage("Start date and time are required.");
      return;
    }

    startTransition(async () => {
      const result = await saveEvent({
        id: event?.id,
        title: draft.title,
        description_en: draft.description_en.trim() || null,
        description_original: rawText.trim() || null,
        category: draft.category,
        starts_at: startsAt,
        ends_at: fromLocalInput(draft.ends_at),
        venue_name: draft.venue_name?.trim() || null,
        address: draft.address?.trim() || null,
        price_info: draft.price_info?.trim() || null,
        image_url: null,
        ticket_url: draft.ticket_url?.trim() || null,
        source_name: sourceName.trim(),
        source_url: sourceUrl.trim(),
        ai_generated: aiGenerated,
        publish,
      });

      setIsError(!result.ok);
      setMessage(result.message);
      if (result.ok && !event) router.push("/admin/events");
      else if (result.ok) router.refresh();
    });
  }

  function onDelete() {
    if (!event) return;
    startTransition(async () => {
      const result = await deleteEvent(event.id);
      if (result.ok) router.push("/admin/events");
      else {
        setIsError(true);
        setMessage(result.message);
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="space-y-8"
    >
      <section className="space-y-4 rounded-lg border border-black/10 p-4">
        <div>
          <h2 className="font-semibold">Source</h2>
          <p className="mt-1 text-xs text-black/60">
            Paste the post text and we&apos;ll draft the English version. The original is kept for
            audit only and is never shown on the site.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="source_name">
              Source name *
            </label>
            <input
              id="source_name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className={FIELD}
              placeholder="Bar La Cueva (Facebook)"
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="source_url">
              Source URL *
            </label>
            <input
              id="source_url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className={FIELD}
              placeholder="https://www.facebook.com/…/posts/…"
            />
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="raw">
            Pasted post text
          </label>
          <textarea
            id="raw"
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className={FIELD}
            placeholder="Paste the Spanish post here…"
          />
        </div>

        <button
          type="button"
          onClick={onDraft}
          disabled={pending || rawText.trim().length < 20}
          className="rounded-lg border border-black/20 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Working…" : "Draft from this text"}
        </button>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">The listing</h2>

        <div>
          <label className={LABEL} htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            required
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            className={FIELD}
          />
        </div>

        <div>
          <label className={LABEL} htmlFor="description_en">
            Description (English, shown publicly)
          </label>
          <textarea
            id="description_en"
            rows={4}
            value={draft.description_en}
            onChange={(e) => set("description_en", e.target.value)}
            className={FIELD}
          />
          {descriptionIsOriginal ? (
            <p className="mt-1 rounded border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              This is still the pasted text. Press <strong>Draft from this text</strong> above, or
              rewrite it in English — the site shouldn&apos;t republish the original post verbatim.
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="starts_at">
              Starts * <span className="font-normal text-black/50">({siteConfig.timeZone})</span>
            </label>
            <input
              id="starts_at"
              type="datetime-local"
              required
              value={draft.starts_at}
              onChange={(e) => set("starts_at", e.target.value)}
              className={FIELD}
            />
            {draft.starts_at ? (
              <p className="mt-1 text-xs font-medium text-teal-700">
                {describeLocal(draft.starts_at)}
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL} htmlFor="ends_at">
              Ends
            </label>
            <input
              id="ends_at"
              type="datetime-local"
              value={draft.ends_at ?? ""}
              onChange={(e) => set("ends_at", e.target.value)}
              className={FIELD}
            />
            {draft.ends_at ? (
              <p className="mt-1 text-xs text-black/50">{describeLocal(draft.ends_at)}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL} htmlFor="category">
              Category *
            </label>
            <select
              id="category"
              value={draft.category}
              onChange={(e) => set("category", e.target.value as Draft["category"])}
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
            <label className={LABEL} htmlFor="price_info">
              Price
            </label>
            <input
              id="price_info"
              value={draft.price_info ?? ""}
              onChange={(e) => set("price_info", e.target.value)}
              className={FIELD}
              placeholder="Free · From 150 MXN"
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="venue_name">
              Venue
            </label>
            <input
              id="venue_name"
              value={draft.venue_name ?? ""}
              onChange={(e) => set("venue_name", e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ticket_url">
              Ticket URL
            </label>
            <input
              id="ticket_url"
              type="url"
              value={draft.ticket_url ?? ""}
              onChange={(e) => set("ticket_url", e.target.value)}
              className={FIELD}
            />
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="address">
            Address
          </label>
          <input
            id="address"
            value={draft.address ?? ""}
            onChange={(e) => set("address", e.target.value)}
            className={FIELD}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4 border-t border-black/10 pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-black/20 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={pending}
          className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Publish"}
        </button>
        {event ? (
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
            className={`whitespace-pre-line text-sm ${isError ? "text-red-600" : "text-black/60"}`}
          >
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
