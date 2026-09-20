export type {
  AffiliateCategory,
  AffiliateDealRow,
  BusRouteRow,
  BusStop,
  ContentStatus,
  Database,
  EventCategory,
  EventRow,
  Json,
  PublicEvent,
  RoutePath,
  SourceRow,
} from "./database";

export { PUBLIC_EVENT_COLUMNS } from "./database";

/** Where a TourAffiliateWidget is rendered — drives layout, not data. */
export type AffiliatePlacement = "sidebar" | "inline" | "footer" | "grid";
