import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  appState,
  favorites,
  knownShows,
  profiles,
  pushSubscriptions,
  sentAlerts,
  trackedArtists,
} from "@/db/schema";
import { getShows } from "./data";
import { fmtDate, fmtDateTime } from "./format";
import { hasLocation, isNear, type UserLocation } from "./geo";
import { sendToUser } from "./push";
import { upcomingSaleStarts } from "./sales";
import { showKey } from "./show-key";
import { locationOf } from "./user-data";
import type { Show } from "./types";

// The check endpoint is public, so it refuses to run more often than this.
// That keeps anyone hammering it from burning through the ticket API quotas.
const MIN_INTERVAL_MS = 25 * 60 * 1000;
// Sale reminders go out once the start time is within this window.
const SALE_REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;

type Prefs = { newShows: boolean; sales: boolean; nearOnly: boolean; loc: UserLocation | null };
const defaultPrefs: Prefs = { newShows: true, sales: true, nearOnly: false, loc: null };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function claimRun(): Promise<boolean> {
  const rows = await db().select().from(appState).where(eq(appState.key, "last_alert_check"));
  const last = rows[0] ? Number(rows[0].value) : 0;
  if (Date.now() - last < MIN_INTERVAL_MS) return false;
  await db()
    .insert(appState)
    .values({ key: "last_alert_check", value: String(Date.now()) })
    .onConflictDoUpdate({ target: appState.key, set: { value: String(Date.now()) } });
  return true;
}

// Records the alert and returns true only the first time, so each alert is
// sent at most once per user even if checks overlap.
async function firstTime(userId: string, alertKey: string) {
  const rows = await db()
    .insert(sentAlerts)
    .values({ userId, alertKey })
    .onConflictDoNothing()
    .returning();
  return rows.length > 0;
}

function place(s: Show) {
  return [s.city, s.region ?? s.country].filter(Boolean).join(", ") || "a new city";
}

export async function runAlertCheck() {
  if (!(await claimRun())) return { skipped: "ran recently" };

  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);

  const [favRows, profileRows, subRows] = await Promise.all([
    db().select().from(favorites),
    db().select().from(profiles),
    db().select({ userId: pushSubscriptions.userId }).from(pushSubscriptions),
  ]);
  const subscribed = new Set(subRows.map((r) => r.userId));
  const prefsByUser = new Map<string, Prefs>(
    profileRows.map((p) => [
      p.userId,
      {
        newShows: p.alertNewShows,
        sales: p.alertSales,
        nearOnly: p.alertNearOnly,
        loc: locationOf(p),
      },
    ]),
  );

  // Only artists followed by someone with notifications on need checking.
  const followersByArtist = new Map<string, { name: string; users: string[] }>();
  for (const f of favRows) {
    if (!subscribed.has(f.userId)) continue;
    const entry = followersByArtist.get(f.artistId) ?? { name: f.artistName, users: [] };
    entry.users.push(f.userId);
    followersByArtist.set(f.artistId, entry);
  }

  let sent = 0;
  for (const [artistId, { name, users }] of followersByArtist) {
    const shows = (
      await getShows({ id: artistId, name, imageUrl: null, genre: null, upcomingShows: 0 })
    ).filter((s) => !s.date || s.date >= today);

    const [known, tracked] = await Promise.all([
      db().select().from(knownShows).where(eq(knownShows.artistId, artistId)),
      db().select().from(trackedArtists).where(eq(trackedArtists.artistId, artistId)),
    ]);
    const knownKeys = new Set(known.map((k) => k.showKey));
    const unseen = shows.filter((s) => !knownKeys.has(showKey(s)));
    if (unseen.length) {
      await db()
        .insert(knownShows)
        .values(unseen.map((s) => ({ artistId, showKey: showKey(s) })))
        .onConflictDoNothing();
    }
    // First time we see this artist, record its shows without announcing them.
    const newShows = tracked.length ? unseen : [];
    if (!tracked.length) {
      await db().insert(trackedArtists).values({ artistId }).onConflictDoNothing();
    }

    for (const userId of users) {
      const prefs = prefsByUser.get(userId) ?? defaultPrefs;
      const relevant = (s: Show) => !prefs.nearOnly || !hasLocation(prefs.loc) || isNear(s, prefs.loc);
      const url = `/artists/${artistId}`;

      if (prefs.newShows) {
        const fresh = [];
        for (const s of newShows.filter(relevant)) {
          if (await firstTime(userId, `new|${artistId}|${showKey(s)}`)) fresh.push(s);
        }
        if (fresh.length === 1) {
          const s = fresh[0];
          sent += await sendToUser(userId, {
            title: `${name} just announced a show`,
            body: `${place(s)} · ${fmtDate(s.date)}${s.venue ? ` · ${s.venue}` : ""}`,
            url,
            tag: `new-${artistId}`,
          });
        } else if (fresh.length > 1) {
          sent += await sendToUser(userId, {
            title: `${name} just announced ${fresh.length} shows`,
            body: fresh.slice(0, 4).map(place).join(" · ") + (fresh.length > 4 ? " and more" : ""),
            url,
            tag: `new-${artistId}`,
          });
        }
      }

      if (prefs.sales) {
        for (const s of shows.filter(relevant)) {
          for (const sale of upcomingSaleStarts(s, SALE_REMINDER_WINDOW_MS, now)) {
            const key = `sale|${artistId}|${showKey(s)}|${sale.label}|${sale.start}`;
            if (!(await firstTime(userId, key))) continue;
            sent += await sendToUser(userId, {
              title: `${name}: ${sale.label} starts soon`,
              body: `${fmtDateTime(sale.start, s.timezone)} · ${place(s)}, ${fmtDate(s.date)}`,
              url,
              tag: `sale-${artistId}-${showKey(s)}`,
            });
          }
        }
      }
    }
    await sleep(500); // stay well under Ticketmaster's requests-per-second limit
  }

  return { artistsChecked: followersByArtist.size, notificationsSent: sent };
}
