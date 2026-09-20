import { slugify } from "@/lib/utils";

export interface ProseBlock {
  heading?: string;
  body: string;
}

/**
 * A line is heading-like when it is short and doesn't read as a sentence.
 * Writers in the admin textarea type section titles this way ("What the route
 * covers") because there is no rich-text editor.
 */
function isHeadingLike(line: string): boolean {
  const words = line.trim().split(/\s+/);
  return words.length > 0 && words.length <= 8 && !/[.!?,;]$/.test(line.trim());
}

/** A leading line that just restates the page title, with or without a "Route:" label. */
function isRedundantTitle(line: string, title: string): boolean {
  const cleaned = line.replace(/^\s*route\s*:\s*/i, "").trim();
  const lineSlug = slugify(cleaned);
  const titleSlug = slugify(title);
  if (!lineSlug || !titleSlug) return false;
  return lineSlug === titleSlug || lineSlug.startsWith(titleSlug);
}

/**
 * A standalone first paragraph that is really just the title. Kept deliberately
 * tight — short and unpunctuated — so a genuine opening sentence that happens to
 * begin with the route name is never thrown away.
 */
function isTitleEcho(body: string, title: string): boolean {
  const words = body.trim().split(/\s+/);
  if (words.length > 12 || /[.!?]$/.test(body.trim())) return false;
  return isRedundantTitle(body, title);
}

/**
 * Turns admin-entered plain text into heading/paragraph blocks.
 *
 * Rules, in order:
 *   - blank lines separate blocks
 *   - a short, punctuation-free first line inside a block becomes its heading
 *   - a block that is only a heading attaches to the block that follows
 *   - a leading block that merely repeats the page title is dropped, since the
 *     <h1> already says it
 */
export function toProse(text: string | null, title: string): ProseBlock[] {
  if (!text) return [];

  const rawBlocks = text
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);

  const blocks: ProseBlock[] = [];
  let pendingHeading: string | undefined;

  for (const lines of rawBlocks) {
    // A lone heading line: hold it and attach to whatever comes next.
    if (lines.length === 1 && isHeadingLike(lines[0])) {
      if (pendingHeading) blocks.push({ heading: pendingHeading, body: "" });
      pendingHeading = lines[0];
      continue;
    }

    let heading = pendingHeading;
    pendingHeading = undefined;
    let bodyLines = lines;

    if (!heading && lines.length > 1 && isHeadingLike(lines[0])) {
      heading = lines[0];
      bodyLines = lines.slice(1);
    }

    blocks.push({ heading, body: bodyLines.join(" ") });
  }

  if (pendingHeading) blocks.push({ heading: pendingHeading, body: "" });

  // Drop a leading title echo — either a standalone heading or a heading that
  // was pulled off the first paragraph.
  const first = blocks[0];
  if (first && blocks.length > 1) {
    if (first.heading && isRedundantTitle(first.heading, title)) {
      if (first.body) blocks[0] = { body: first.body };
      else blocks.shift();
    } else if (!first.heading && isTitleEcho(first.body, title)) {
      // A title line too long to look like a heading (e.g. "Route: Urías –
      // Sábalo Marina Mazatlán – La Sirena") lands here as a paragraph.
      blocks.shift();
    }
  }

  return blocks.filter((block) => block.heading || block.body);
}

/** First real paragraph — what the meta description should be built from. */
export function leadParagraph(blocks: ProseBlock[]): string | null {
  return blocks.find((block) => block.body)?.body ?? null;
}
