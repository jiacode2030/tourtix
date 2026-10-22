import { currentUserId } from "@/auth";
import { passportCard } from "@/lib/passport-card";
import { listStamps } from "@/lib/user-data";

// The picture for "Share my passport". Built from the signed-in user's own
// stamps only, so the link is useless to anyone else, and it isn't cached or stored.
export async function GET(req: Request) {
  const userId = await currentUserId();
  if (!userId) return new Response("Sign in to see your passport.", { status: 401 });

  const stamps = await listStamps(userId);
  if (stamps.length === 0) return new Response("No stamps yet.", { status: 404 });

  const q = new URL(req.url).searchParams;
  const name = (q.get("name") ?? "").replace(/\s+/g, " ").trim().slice(0, 20) || null;
  const image = await passportCard(stamps, {
    showDates: q.get("dates") !== "0",
    showCities: q.get("cities") === "1",
    name,
  });
  const headers = new Headers(image.headers);
  headers.set("Cache-Control", "private, no-store");
  return new Response(image.body, { status: 200, headers });
}
