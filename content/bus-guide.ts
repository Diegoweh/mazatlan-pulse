/**
 * Cornerstone copy for /bus-routes.
 *
 * Empty sections are skipped at render time, so an unwritten section never ships
 * as a bare heading. Fill a `body` and it appears — no code change needed.
 *
 * `prompts` is authoring guidance and is never rendered. They are the questions
 * a visitor actually types into Google; answering them plainly is what makes
 * this page rank and what makes it useful.
 *
 * Nothing here should be written from memory or assumption. Every claim about
 * fares, payment, safety or timing belongs to someone who has ridden the route.
 */
export interface GuideSection {
  id: string;
  heading: string;
  /** Not rendered. What this section has to answer before it's worth publishing. */
  prompts: string[];
  /**
   * Optional illustrations. One floats beside the prose; two render as a
   * side-by-side comparison, which is the right shape when the point is telling
   * two things apart.
   *
   * Sources are 360-600px wide, so neither layout goes past ~300 CSS px.
   */
  images?: { src: string; alt: string; caption: string }[];
  /** Paragraphs. Leave empty until the facts are verified in person. */
  body: string[];
}

export const busGuideIntro =
  "Mazatlán's public buses are the cheapest way to move between the Golden Zone, Centro and the northern beaches, and they run often enough that you rarely wait long. If you can read a route name and recognise a few landmarks, you can use them on your first day.";

export const busGuideSections: GuideSection[] = [
  {
    id: "paying",
    heading: "Paying your fare",
    prompts: [
      "What does a ride cost right now, and does the air-conditioned bus cost more than the green one?",
      "Do you pay the driver as you board, or is there a machine?",
      "Coins or bills? What's the largest note a driver will realistically break?",
      "Do they give change, or should you have it ready?",
      "Any passes, transfers, or reduced fares for seniors and students?",
      "Do small children pay?",
    ],
    body: [
      "You pay in cash, to the driver, the moment you step on. No machine, no card reader, no transfers.",
      "Air-conditioned buses — the green, white-and-red and tourist-style units — charge 15 pesos, except Sábalo–Centro, which charges 16. The older buses without climate control charge 13. Each route page lists its own fare.",
      "Carry coins, or notes of 20 or 50. A 100-peso note gets taken reluctantly. Hand over 200 or 500 and you will either be waved off or left standing while the driver scrapes together change.",
      "There is a student fare of roughly 3.50 to 4.50 pesos, but only with an activated Tarjeta Inteligente de Sinaloa — an ordinary student ID will not do it. Small children pay full fare if they take a seat.",
    ],
  },
  {
    id: "flagging",
    heading: "Catching the bus and getting off",
    prompts: [
      "Are there marked stops, or do you flag it down anywhere on the route?",
      "How do you signal a driver to stop for you — a wave, a hand out?",
      "Which door do you board and which do you exit?",
      "How do you tell the driver you want off — a buzzer, a cord, calling out?",
      "How far ahead do you need to signal so he actually stops in time?",
      "What happens if you miss your stop?",
    ],
    body: [
      "There are marked stops along the malecón and the main avenues, but in practice the driver will pick you up wherever you flag him down, as long as he is not sitting at a green light or stuck in a centre lane.",
      "To flag one, put your arm out firmly, angled down toward the road, as the bus comes into view.",
      "You board at the front, always, and get off through the rear door.",
      "To get off, press the buzzer — a button on the grab rails or by the back door. If it does not work, and sometimes it does not, call toward the front: ¡Bajan! or ¡En la esquina, por favor!",
      "Signal about a block ahead, 50 to 100 metres, so he can pull over instead of standing on the brakes.",
    ],
  },
  {
    id: "timing",
    heading: "When to ride, and when not to",
    prompts: [
      "Which hours are packed, and will you get a seat outside them?",
      "When does the last bus run, and what do you do if you miss it?",
      "Do Sundays and holidays run a different service?",
      "Is riding at night fine, and if there's anything to watch for, say it plainly.",
      "Anything a visitor should know about luggage, surfboards or groceries on board?",
    ],
    body: [
      "Buses fill up from 7 to 9 in the morning, when school and work start, and again from 6 to 8 in the evening.",
      "After 9 pm most routes thin out sharply. Sábalo–Centro keeps running through the tourist strip until around 10:30.",
      "Sundays and holidays run less often. Expect your wait to roughly double, and expect service to wind down earlier.",
      "At night, plainly: inside the tourist corridor — Zona Dorada, the malecón, Centro — the bus is safe, just slow. Outside that circuit, or after 10 pm, take a rideshare or a taxi instead.",
    ],
  },
  {
    id: "alternatives",
    heading: "Buses vs pulmonías, taxis and rideshare",
    images: [
      {
      src: "/images/pulmonia.webp",
      alt: "A white pulmon\u00eda \u2014 an open-sided, canopy-roofed vehicle built on a car chassis \u2014 parked on the Mazatl\u00e1n mal\u00e9con beside the giant coloured MAZATL\u00c1N letters, with an island on the horizon.",
      caption: "Pulmon\u00eda \u2014 white, VW-based",
      },
      {
        src: "/images/uriga.webp",
        alt: "A red auriga \u2014 an open pickup fitted with bench seats under a striped canopy \u2014 carrying passengers along the Mazatl\u00e1n mal\u00e9con, with the beach and hotel towers behind.",
        caption: "Auriga \u2014 red, pickup-based",
      },
    ],
    prompts: [
      "What is a pulmonía, for someone who has never seen one?",
      "Roughly what does Golden Zone → Centro cost by bus, pulmonía, taxi and rideshare?",
      "Do you agree the price before getting in? How do you avoid being overcharged?",
      "When is each one actually the better choice — late at night, with luggage, in a group?",
      "Do Uber and DiDi work here, and will they pick up at hotels?",
    ],
    body: [
      "A pulmonía is Mazatlán's own invention: an open-sided vehicle built on a classic Volkswagen chassis, canvas roof, no doors, no windows, and a sound system considerably larger than the car.",
      "The red ones are aurigas: the same open-air idea on a pickup chassis, bench seats under a canopy, and room for a bigger group. They run 300 to 700 pesos depending on distance, or 200 pesos an hour if you hire one by time.",
      "Golden Zone to Centro, roughly: 15 pesos a person on the bus. Uber or DiDi, 100 to 160 depending on surge. A red or green taxi, 180 to 220. A pulmonía, 200 to 250.",
      "With taxis and pulmonías, agree the price before you get in — every time. Ask ¿Cuánto me cobras al Centro? and settle it on the kerb. Uber and DiDi set the price in the app.",
      "Both apps work well here and will collect you at any hotel entrance.",
    ],
  },
  {
    id: "faro",
    heading: "Getting to El Faro and Centro",
    images: [
      {
      src: "/images/faro-top-view.webp",
      alt: "Aerial view of the lighthouse on Cerro del Crest\u00f3n, its white buildings and red lantern room on a green headland, with the glass skywalk platform jutting out over the sea.",
      caption: "The lighthouse and the glass viewpoint",
      },
    ],
    prompts: [
      "Sábalo–Centro is the one route that covers the tourist zone — say so, and link to it.",
      "Where do you get off for the lighthouse, and how far is the walk from there?",
      "Where do you get off for Plazuela Machado, the market and the cathedral?",
      "Roughly how long does Golden Zone → Centro take on the bus?",
      "Best time of day to make the climb, and what to bring.",
    ],
    body: [
      "Sábalo–Centro is the one route that covers the tourist zone end to end, which makes it the one most visitors actually want.",
      "For the lighthouse, take Sábalo–Centro to the end of the line, near the urban bus terminal by the docks on Playa Sur. From there it is a 5 to 10 minute walk to the base of Cerro del Crestón. Cerritos does not go there.",
      "For the cathedral and Mercado Pino Suárez, ask to be let off on Benito Juárez or Zaragoza and you will be a block or two away. For Plazuela Machado, get off near the market or around Olas Altas and Heriberto Frías, then walk three or four blocks.",
      "Golden Zone to Centro takes 35 to 50 minutes by bus depending on traffic, against 20 to 30 by car.",
      "The glass viewpoint at the top runs 6:00 am to 5:15 pm. Climb early, 6:30 to 8 am, to beat the heat. If you want the viewpoint, start up well before 5:15 — a sunset climb gets you the hill, but the glass platform will already be shut.",
    ],
  },
  {
    id: "airport",
    heading: "Getting to and from the airport",
    prompts: [
      "Does any public bus serve the airport in a way that's actually useful with luggage?",
      "What are the realistic options and what do they cost?",
      "Where do you arrange a transfer once you land?",
      "How long does the trip take to the Golden Zone and to Centro?",
      "Anything to know about the return trip, like booking ahead?",
    ],
    body: [
      "No city bus serves Mazatlán International (MZT) in any way that is useful with luggage. Do not plan around one.",
      "The shared airport van runs about 150 to 200 pesos a person. An authorised private airport taxi is around 450 to 600 to the Golden Zone. Going the other way, hotel to airport, Uber or DiDi runs 250 to 350.",
      "Arriving is the awkward direction: app pickups are generally restricted inside the airport's federal zone, so you would have to walk out to the highway to be collected. Arrange your transfer at the official transport desks inside the arrivals hall, before you step outside.",
      "Either direction, the trip is 30 to 45 minutes over roughly 25 to 30 km, to Centro or the Golden Zone.",
    ],
  },
];
