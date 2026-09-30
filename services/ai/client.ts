import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { requireEnv } from "@/lib/env";

/**
 * Model used by the ingest pipeline. Recorded on every row as `events.ai_model`.
 *
 * Haiku by choice: this task is field extraction from a short, already-written
 * post, not reasoning. Roughly $0.003 per event instead of $0.014.
 */
export const INGEST_MODEL = "claude-haiku-4-5";

/** Beta flag required for `output_format` structured outputs on this SDK version. */
export const STRUCTURED_OUTPUTS_BETA = "structured-outputs-2025-11-13";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  // An org-level key (one not created inside a workspace) is rejected unless the
  // workspace is named explicitly. Keys created inside a workspace carry it
  // themselves and need no header, so this stays optional.
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID?.trim();

  client ??= new Anthropic({
    apiKey: requireEnv("ANTHROPIC_API_KEY"),
    ...(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {}),
  });
  return client;
}
