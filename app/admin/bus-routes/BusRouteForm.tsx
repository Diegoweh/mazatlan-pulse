"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { BusRouteRow, BusStop, RoutePath } from "@/types";

import { deleteBusRoute, saveBusRoute } from "./actions";

const FIELD =
  "w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25";
const LABEL = "block text-sm font-medium mb-1";

type StopDraft = { name: string; lat: string; lng: string };

function toStopDrafts(stops: BusStop[]): StopDraft[] {
  if (stops.length === 0) return [{ name: "", lat: "", lng: "" }];
  return [...stops]
    .sort((a, b) => a.order - b.order)
    .map((stop) => ({ name: stop.name, lat: String(stop.lat), lng: String(stop.lng) }));
}

/** One "lat, lng" pair per line — the format is easy to paste out of a map tool. */
function pathToText(path: RoutePath): string {
  return path.map(([lat, lng]) => `${lat}, ${lng}`).join("\n");
}

/**
 * Turns the stop rows into saveable stops.
 *
 * Rows that are entirely blank are ignored; a row that is *partly* filled is an
 * error, never a silent drop. Without this, a missing name loses the row and a
 * missing coordinate becomes Number("") === 0 — a stop at 0°,0° in the Atlantic,
 * which zod happily accepts because 0 is a valid latitude.
 */
function collectStops(drafts: StopDraft[]):
  | { ok: true; stops: BusStop[] }
  | { ok: false; problems: string[] } {
  const stops: BusStop[] = [];
  const problems: string[] = [];

  drafts.forEach((draft, index) => {
    const name = draft.name.trim();
    const lat = draft.lat.trim();
    const lng = draft.lng.trim();
    if (!name && !lat && !lng) return;

    const missing: string[] = [];
    if (!name) missing.push("name");
    if (!lat) missing.push("latitude");
    if (!lng) missing.push("longitude");
    if (missing.length > 0) {
      problems.push(`Stop ${index + 1} is missing ${missing.join(" and ")}.`);
      return;
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      problems.push(`Stop ${index + 1} has coordinates that aren't numbers.`);
      return;
    }

    stops.push({ name, lat: latitude, lng: longitude, order: stops.length + 1 });
  });

  return problems.length > 0 ? { ok: false, problems } : { ok: true, stops };
}

function parsePath(text: string): { path: RoutePath; badLines: number[] } {
  const path: RoutePath = [];
  const badLines: number[] = [];

  text
    .split("\n")
    .map((line) => line.trim())
    .forEach((line, index) => {
      if (!line) return;
      const [lat, lng] = line.split(",").map((part) => Number(part.trim()));
      if (Number.isFinite(lat) && Number.isFinite(lng)) path.push([lat, lng]);
      else badLines.push(index + 1);
    });

  return { path, badLines };
}

export function BusRouteForm({ route }: { route: BusRouteRow | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [stops, setStops] = useState<StopDraft[]>(toStopDrafts(route?.key_stops ?? []));
  const [pathText, setPathText] = useState(pathToText(route?.route_path ?? []));

  function updateStop(index: number, patch: Partial<StopDraft>) {
    setStops((current) =>
      current.map((stop, i) => (i === index ? { ...stop, ...patch } : stop)),
    );
  }

  function onSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = new FormData(formEvent.currentTarget);
    const text = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" && value.trim() ? value.trim() : null;
    };

    const collected = collectStops(stops);
    if (!collected.ok) {
      setIsError(true);
      setMessage(collected.problems.join(" "));
      return;
    }

    const { path, badLines } = parsePath(pathText);
    if (badLines.length > 0) {
      setIsError(true);
      setMessage(`Route path: couldn't read line(s) ${badLines.join(", ")}. Use "lat, lng".`);
      return;
    }

    const fare = text("fare_mxn");

    startTransition(async () => {
      const result = await saveBusRoute({
        id: route?.id,
        slug: text("slug") ?? undefined,
        route_name: form.get("route_name") as string,
        route_number: text("route_number"),
        color_hex: text("color_hex"),
        fare_mxn: fare === null ? null : Number(fare),
        fare_notes: text("fare_notes"),
        tourist_tips_en: text("tourist_tips_en"),
        operating_hours: text("operating_hours"),
        frequency_notes: text("frequency_notes"),
        is_active: form.get("is_active") === "on",
        sort_order: Number(text("sort_order") ?? 0),
        mark_verified: form.get("mark_verified") === "on",
        key_stops: collected.stops,
        route_path: path,
      });

      setIsError(!result.ok);
      setMessage(result.message);
      if (result.ok && !route) router.push("/admin/bus-routes");
      else if (result.ok) router.refresh();
    });
  }

  function onDelete() {
    if (!route) return;
    startTransition(async () => {
      const result = await deleteBusRoute(route.id);
      if (result.ok) router.push("/admin/bus-routes");
      else {
        setIsError(true);
        setMessage(result.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="route_name">
            Route name *
          </label>
          <input
            id="route_name"
            name="route_name"
            required
            defaultValue={route?.route_name ?? ""}
            className={FIELD}
            placeholder="Sábalo–Centro"
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="route_number">
            Route number
          </label>
          <input
            id="route_number"
            name="route_number"
            defaultValue={route?.route_number ?? ""}
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="slug">
            Slug (blank = from name)
          </label>
          <input id="slug" name="slug" defaultValue={route?.slug ?? ""} className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="color_hex">
            Map colour
          </label>
          <input
            id="color_hex"
            name="color_hex"
            defaultValue={route?.color_hex ?? ""}
            className={FIELD}
            placeholder="#1D9BF0"
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="fare_mxn">
            Fare (MXN)
          </label>
          <input
            id="fare_mxn"
            name="fare_mxn"
            type="number"
            step="0.5"
            min="0"
            defaultValue={route?.fare_mxn ?? ""}
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="sort_order">
            Sort order (lower shows first)
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            step="10"
            min="0"
            defaultValue={route?.sort_order ?? 0}
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="operating_hours">
            Operating hours
          </label>
          <input
            id="operating_hours"
            name="operating_hours"
            defaultValue={route?.operating_hours ?? ""}
            className={FIELD}
            placeholder="05:30–22:30 daily"
          />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="fare_notes">
          Fare notes
        </label>
        <input
          id="fare_notes"
          name="fare_notes"
          defaultValue={route?.fare_notes ?? ""}
          className={FIELD}
          placeholder="Air-conditioned units cost more"
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="frequency_notes">
          Frequency
        </label>
        <input
          id="frequency_notes"
          name="frequency_notes"
          defaultValue={route?.frequency_notes ?? ""}
          className={FIELD}
          placeholder="Every 10–15 min"
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="tourist_tips_en">
          Tips for visitors (English, shown on the public page)
        </label>
        <textarea
          id="tourist_tips_en"
          name="tourist_tips_en"
          rows={5}
          defaultValue={route?.tourist_tips_en ?? ""}
          className={FIELD}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Key stops (in travel order)</legend>
        {stops.map((stop, index) => (
          <div key={index} className="grid grid-cols-[1fr_7rem_7rem_2rem] gap-2">
            <input
              aria-label={`Stop ${index + 1} name`}
              value={stop.name}
              onChange={(e) => updateStop(index, { name: e.target.value })}
              className={FIELD}
              placeholder="Golden Zone"
            />
            <input
              aria-label={`Stop ${index + 1} latitude`}
              value={stop.lat}
              onChange={(e) => updateStop(index, { lat: e.target.value })}
              className={FIELD}
              placeholder="23.2586"
            />
            <input
              aria-label={`Stop ${index + 1} longitude`}
              value={stop.lng}
              onChange={(e) => updateStop(index, { lng: e.target.value })}
              className={FIELD}
              placeholder="-106.4553"
            />
            <button
              type="button"
              aria-label={`Remove stop ${index + 1}`}
              onClick={() => setStops((c) => c.filter((_, i) => i !== index))}
              className="text-black/40 hover:text-red-600 dark:text-white/40"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setStops((c) => [...c, { name: "", lat: "", lng: "" }])}
          className="text-sm underline"
        >
          Add stop
        </button>
      </fieldset>

      <div>
        <label className={LABEL} htmlFor="route_path">
          Route path — one <code>lat, lng</code> per line (optional, for drawing the line)
        </label>
        <textarea
          id="route_path"
          rows={5}
          value={pathText}
          onChange={(e) => setPathText(e.target.value)}
          className={`${FIELD} font-mono`}
          placeholder={"23.2586, -106.4553\n23.2100, -106.4200"}
        />
      </div>

      <div className="space-y-2 rounded-lg border border-black/10 p-4 dark:border-white/15">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={route?.is_active ?? true} />
          Active (visible on the public site)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="mark_verified" />
          I checked this route in person today — set last verified
        </label>
        <p className="text-xs text-black/50 dark:text-white/50">
          {route?.last_verified_at
            ? `Last verified ${new Date(route.last_verified_at).toLocaleDateString("en-US")}.`
            : "Never verified — the public page shows a provisional warning."}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : route ? "Save changes" : "Create route"}
        </button>
        {route ? (
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
            className={`text-sm ${isError ? "text-red-600" : "text-black/60 dark:text-white/60"}`}
          >
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
