/**
 * Manual entry point for the event ingest pipeline.
 *
 *   npm run ingest:events            # all active sources
 *   npm run ingest:events -- --source=<uuid>
 *
 * The same work runs on a schedule via app/api/cron/ingest-events/route.ts.
 */
import { runEventIngest } from "@/services/events/ingest";

async function main() {
  const sourceArg = process.argv.find((arg) => arg.startsWith("--source="));
  const sourceId = sourceArg?.split("=")[1];

  const report = await runEventIngest(sourceId ? { sourceId } : undefined);
  console.log(JSON.stringify(report, null, 2));

  if (report.errors.length > 0) process.exitCode = 1;
}

void main();
