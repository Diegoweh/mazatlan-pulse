import { runEventIngest } from "@/services/events/ingest";

// No `runtime` export: cacheComponents rejects that segment config, and Node is
// the default anyway — which this route needs for Cheerio and the Anthropic SDK.
export const maxDuration = 300;

/**
 * Vercel Cron target (schedule lives in vercel.json).
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; anything else is rejected so
 * the endpoint can't be used to burn API credit. Output is always pending_review.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await runEventIngest();
  return Response.json(report, { status: report.errors.length > 0 ? 207 : 200 });
}
