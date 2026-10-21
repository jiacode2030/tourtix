import { eq } from "drizzle-orm";
import webpush from "web-push";
import { db } from "@/db";
import { appState, pushSubscriptions } from "@/db/schema";
import { siteUrl } from "./site";

export type PushPayload = { title: string; body: string; url: string; tag?: string };

type VapidKeys = { publicKey: string; privateKey: string };

let cached: VapidKeys | null = null;

// VAPID keys identify this site to browser push services. They're generated
// on first use and kept in the database, so there's nothing to configure.
// Changing them would invalidate every existing subscription.
export async function getVapidKeys(): Promise<VapidKeys> {
  if (cached) return cached;
  const read = async () =>
    (await db().select().from(appState).where(eq(appState.key, "vapid_keys")))[0];
  let row = await read();
  if (!row) {
    const keys = webpush.generateVAPIDKeys();
    await db()
      .insert(appState)
      .values({ key: "vapid_keys", value: JSON.stringify(keys) })
      .onConflictDoNothing();
    row = await read(); // another request may have won the race
  }
  cached = JSON.parse(row!.value) as VapidKeys;
  return cached;
}

// Sends to every device the user enabled. Returns how many got it.
export async function sendToUser(userId: string, payload: PushPayload) {
  const keys = await getVapidKeys();
  const subs = await db()
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
  let delivered = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
        { vapidDetails: { subject: siteUrl(), ...keys }, TTL: 60 * 60 * 24 },
      );
      delivered++;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        // The browser unsubscribed or the subscription expired.
        await db().delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
      } else {
        console.error("push failed", status, err);
      }
    }
  }
  return delivered;
}
