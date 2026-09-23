/**
 * Cornerstone copy for /bus-routes.
 *
 * Empty sections are skipped at render time, so an unwritten section never ships
 * as a placeholder. Fill a `body` and it appears — no code change needed.
 *
 * Nothing here should be written from memory or assumption. Every claim about
 * fares, payment, safety or timing belongs to someone who has ridden the route.
 */
export interface GuideSection {
  id: string;
  heading: string;
  /** Paragraphs. Leave the array empty until the facts are verified in person. */
  body: string[];
}

export const busGuideIntro =
  "Mazatlán's public buses are the cheapest way to move between the Golden Zone, Centro and the northern beaches, and they run often enough that you rarely wait long. If you can read a route name and recognise a few landmarks, you can use them on your first day.";

export const busGuideSections: GuideSection[] = [
  {
    id: "paying",
    heading: "Paying your fare",
    // TODO(diego): write after confirming on board — do coins and small bills
    // both work, does the driver give change, are there passes or transfers?
    body: [],
  },
  {
    id: "flagging",
    heading: "Catching and stopping the bus",
    // TODO(diego): how you signal a bus to stop for you, where buses actually
    // pull over, and how you tell the driver you want off.
    body: [],
  },
  {
    id: "timing",
    heading: "When to ride, and when not to",
    // TODO(diego): rush hours, how full they get, night service, Sundays.
    body: [],
  },
  {
    id: "alternatives",
    heading: "Buses vs pulmonías, taxis and rideshare",
    // TODO(diego): rough price comparison and when each is worth it. Do not
    // publish prices you haven't checked this season.
    body: [],
  },
  {
    id: "airport",
    heading: "Getting to and from the airport",
    // TODO(diego): whether a public bus serves MZT usefully, and what the
    // realistic options are.
    body: [],
  },
];
