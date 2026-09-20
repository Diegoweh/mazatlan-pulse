import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { requireEnv } from "@/lib/env";

/** Model used by the ingest pipeline. Recorded on every row as `events.ai_model`. */
export const INGEST_MODEL = "claude-opus-5";

/** Beta flag required for `output_format` structured outputs on this SDK version. */
export const STRUCTURED_OUTPUTS_BETA = "structured-outputs-2025-11-13";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  client ??= new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
  return client;
}
