/**
 * Hand-written stopgap that mirrors supabase/migrations.
 * Replace with generated types once the project is linked:
 *   npm run db:types
 *
 * Row shapes are `type` aliases, not interfaces, on purpose: interfaces have no
 * implicit index signature, so supabase-js rejects the schema as non-generic and
 * silently collapses every query result to `never`.
 */

export type ContentStatus = "pending_review" | "published" | "archived" | "rejected";

export type EventCategory =
  | "music"
  | "nightlife"
  | "festival"
  | "sports"
  | "food_drink"
  | "arts_culture"
  | "family"
  | "community"
  | "other";

export type AffiliateCategory =
  | "tour"
  | "activity"
  | "hotel"
  | "car_rental"
  | "airport_transfer"
  | "insurance"
  | "other";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface BusStop {
  name: string;
  lat: number;
  lng: number;
  order: number;
}

/** [lat, lng] pairs. */
export type RoutePath = [number, number][];

export type SourceRow = {
  id: string;
  name: string;
  base_url: string;
  scrape_config: Json;
  is_active: boolean;
  last_scraped_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  description_en: string | null;
  /** Audit-only. Not readable by anon/authenticated — service_role queries only. */
  description_original: string | null;
  category: EventCategory;
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  price_info: string | null;
  image_url: string | null;
  ticket_url: string | null;
  source_id: string | null;
  source_name: string;
  source_url: string;
  ai_generated: boolean;
  ai_model: string | null;
  status: ContentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type BusRouteRow = {
  id: string;
  slug: string;
  route_name: string;
  route_number: string | null;
  color_hex: string | null;
  fare_mxn: number | null;
  fare_notes: string | null;
  key_stops: BusStop[];
  route_path: RoutePath;
  tourist_tips_en: string | null;
  operating_hours: string | null;
  frequency_notes: string | null;
  last_verified_at: string | null;
  is_active: boolean;
  /** Lower shows first. Ties break on route_name. */
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type AffiliateDealRow = {
  id: string;
  slug: string;
  title: string;
  category: AffiliateCategory;
  provider: string;
  affiliate_url: string;
  estimated_commission_pct: number | null;
  price_from_usd: number | null;
  image_url: string | null;
  location_name: string | null;
  short_description_en: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      sources: Table<SourceRow>;
      events: Table<EventRow>;
      bus_routes: Table<BusRouteRow>;
      affiliate_deals: Table<AffiliateDealRow>;
    };
    // NOTE: must be an empty mapped type, not Record<string, never>. PostgREST
    // intersects Tables & Views, and an index signature would collapse every
    // table lookup to `never`.
    Views: { [_ in never]: never };
    Functions: {
      increment_affiliate_click: {
        Args: { deal_slug: string };
        Returns: undefined;
      };
      publish_event: {
        Args: { event_id: string; reviewer: string };
        Returns: EventRow;
      };
    };
    Enums: {
      content_status: ContentStatus;
      event_category: EventCategory;
      affiliate_category: AffiliateCategory;
    };
    CompositeTypes: { [_ in never]: never };
  };
}

/** Columns anon/authenticated are granted on `events`. `select *` is denied by design. */
export const PUBLIC_EVENT_COLUMNS = [
  "id",
  "slug",
  "title",
  "description_en",
  "category",
  "starts_at",
  "ends_at",
  "venue_name",
  "address",
  "lat",
  "lng",
  "price_info",
  "image_url",
  "ticket_url",
  "source_name",
  "source_url",
  "ai_generated",
  "status",
  "created_at",
  "updated_at",
] as const;

export type PublicEvent = Pick<EventRow, (typeof PUBLIC_EVENT_COLUMNS)[number]>;
