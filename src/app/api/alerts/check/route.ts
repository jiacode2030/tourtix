import { runAlertCheck } from "@/lib/alerts";

// Called hourly by .github/workflows/check-alerts.yml. Safe to call publicly:
// runAlertCheck refuses to run more than about twice an hour.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    return Response.json(await runAlertCheck());
  } catch (err) {
    console.error(err);
    return Response.json({ error: "check failed" }, { status: 500 });
  }
}
