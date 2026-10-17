/**
 * Contact address, split so it never appears as a literal in the served HTML.
 *
 * Harvesting bots grep pages for user@domain and mailto: links. Keeping the
 * pieces apart and assembling them only on click keeps the address out of the
 * markup while staying usable for people.
 */
export const contact = {
  name: "Diego Celaya",
  user: "diegocelaia",
  domain: "outlook.com",
};

/** Human-readable form for the page text: legible to people, not to regexes. */
export const contactDisplay = `${contact.user} (at) ${contact.domain.replace(".", " (dot) ")}`;
