/**
 * Venados de Mazatlán, 2026–27 LMP season.
 *
 * Transcribed by hand from the club's official calendar graphic (Oct–Dec). The
 * graphic itself isn't published here: it's the club's artwork, unreadable at
 * phone width, and invisible to search. Dates and opponents are facts; we
 * re-state them as data.
 *
 * The calendar gives no first-pitch times, so none are invented here.
 */
export interface Series {
  opponent: string;
  /** Opponent's home city, shown so visitors can tell the teams apart. */
  city: string;
  home: boolean;
  /** Mazatlán calendar dates, YYYY-MM-DD. */
  dates: string[];
  note?: string;
}

export const SEASON_LABEL = "2026–27";
export const STADIUM = "Estadio Teodoro Mariscal";

const TEAMS = {
  tomateros: { opponent: "Tomateros", city: "Culiacán" },
  algodoneros: { opponent: "Algodoneros", city: "Guasave" },
  yaquis: { opponent: "Yaquis", city: "Ciudad Obregón" },
  charros: { opponent: "Charros", city: "Jalisco" },
  naranjeros: { opponent: "Naranjeros", city: "Hermosillo" },
  jaguares: { opponent: "Jaguares", city: "Nayarit" },
  aguilas: { opponent: "Águilas", city: "Mexicali" },
  mayos: { opponent: "Mayos", city: "Navojoa" },
  caneros: { opponent: "Cañeros", city: "Los Mochis" },
} as const;

function days(month: number, ...dayNumbers: number[]): string[] {
  return dayNumbers.map(
    (day) => `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  );
}

export const schedule: Series[] = [
  { ...TEAMS.tomateros, home: false, dates: days(10, 14, 15), note: "Opening day" },
  { ...TEAMS.algodoneros, home: true, dates: days(10, 16, 17, 18), note: "Home opener" },
  { ...TEAMS.yaquis, home: false, dates: days(10, 20, 21, 22) },
  { ...TEAMS.charros, home: true, dates: days(10, 23, 24, 25) },
  { ...TEAMS.naranjeros, home: false, dates: days(10, 27, 28, 29) },
  { ...TEAMS.jaguares, home: true, dates: [...days(10, 30, 31), ...days(11, 1)] },
  { ...TEAMS.aguilas, home: false, dates: days(11, 3, 4, 5) },
  { ...TEAMS.mayos, home: false, dates: days(11, 6, 7, 8) },
  { ...TEAMS.caneros, home: true, dates: days(11, 10, 11, 12) },
  { ...TEAMS.tomateros, home: false, dates: days(11, 13, 14, 15) },
  { ...TEAMS.charros, home: true, dates: days(11, 17, 18, 19) },
  { ...TEAMS.algodoneros, home: false, dates: days(11, 20, 21, 22), note: "End of first half" },
  { ...TEAMS.yaquis, home: true, dates: days(11, 24, 25, 26), note: "Second half begins" },
  { ...TEAMS.charros, home: false, dates: days(11, 27, 28, 29) },
  { ...TEAMS.naranjeros, home: true, dates: days(12, 1, 2, 3) },
  { ...TEAMS.jaguares, home: false, dates: days(12, 4, 5, 6) },
  { ...TEAMS.aguilas, home: true, dates: days(12, 8, 9, 10) },
  { ...TEAMS.mayos, home: true, dates: days(12, 11, 12, 13) },
  { ...TEAMS.caneros, home: false, dates: days(12, 15, 16, 17) },
  { ...TEAMS.tomateros, home: true, dates: days(12, 18, 19, 20) },
  { ...TEAMS.charros, home: false, dates: days(12, 21, 22, 23) },
  { ...TEAMS.algodoneros, home: true, dates: days(12, 25, 26, 27) },
  { ...TEAMS.yaquis, home: false, dates: days(12, 28, 29, 30) },
];

/**
 * Practical sections, rendered only once `body` has text — same contract as
 * content/bus-guide.ts. `prompts` are never rendered.
 */
export interface BallparkSection {
  id: string;
  heading: string;
  prompts: string[];
  body: string[];
  /** Optional label/value rows, e.g. a price list, rendered under the body. */
  rows?: { label: string; value: string }[];
  /** Renders a map pinned here, under the body. */
  place?: { lat: number; lng: number; name: string; query: string };
}

export const ballparkGuide: BallparkSection[] = [
  {
    id: "times",
    heading: "Game times",
    prompts: ["What time is first pitch on weeknights, and on weekends?", "When should you arrive?"],
    body: [
      "There are no games on most Mondays. These are the usual first-pitch times, but the league sometimes moves a game, so check the time for your date before you head out.",
    ],
    rows: [
      { label: "Tuesday to Friday", value: "7:10 or 7:30 pm" },
      { label: "Saturday", value: "6:00 pm" },
      { label: "Sunday", value: "5:00 pm" },
    ],
  },
  {
    id: "tickets",
    heading: "Tickets",
    prompts: [
      "Roughly what does a seat cost, cheapest to best?",
      "Buy online or at the box office? Do big games sell out?",
    ],
    body: [
      "Prices are per game, in pesos, for the 2026–27 season. The box office takes both cash and card.",
    ],
    rows: [
      { label: "Deluxe Supreme", value: "$820 MXN" },
      { label: "Diamante", value: "$630 MXN" },
      { label: "Platino", value: "$570 MXN" },
      { label: "Sky Plus", value: "$400 MXN" },
      { label: "Oro", value: "$380 MXN" },
      { label: "Plus", value: "$300 MXN" },
      { label: "Sky", value: "$280 MXN" },
      { label: "Zona Fan / Zona Fan Plus", value: "$170 MXN" },
    ],
  },
  {
    id: "getting-there",
    heading: "Getting there",
    prompts: [
      "Which bus route passes the stadium, and where do you get off?",
      "Getting home after a night game: buses still running, or pulmonía/taxi?",
    ],
    body: ["No bus route goes directly to the stadium. Here's where it is, so you can plan the trip."],
    // OpenStreetMap centroid of the stadium (Nominatim). The Google embed URL
    // gives its viewport centre, which sits ~250 m west of the ballpark.
    place: {
      lat: 23.235713,
      lng: -106.432337,
      name: STADIUM,
      query: "Estadio de Béisbol Teodoro Mariscal, Mazatlán",
    },
  },
  {
    id: "tips",
    heading: "At the game",
    prompts: ["Cash or card inside?", "What to eat and drink, what to bring, what's not allowed?"],
    body: [],
  },
];
