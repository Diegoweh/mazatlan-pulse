import { serializeJsonLd } from "@/lib/schema-org";

/**
 * Renders a JSON-LD block. Content is our own serialized object, never user input,
 * so dangerouslySetInnerHTML is the correct tool here (React would escape the
 * quotes inside a text child and break the parser).
 */
export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}
