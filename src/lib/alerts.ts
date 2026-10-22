import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  appState,
  favorites,
  knownPresales,
  knownShows,
  profiles,
  pushSubscriptions,
  sentAlerts,
  trackedArtists,
} from "@/db/schema";
import { getShows } from "./data";
import { localKey } from "./drops";
import { fmtDate, fmtDateTime } from "./format";
import { hasLocation, isNear, type UserLocation } from "./geo";
import { presaleKey } from "./presale-names";
import { sendToUser } from "./push";
import { realPresales, upcomingSaleStarts } from "./sales";
import { showKey } from "./show-key";
import { locationOf } from "./user-data";
import type { Show } from "./types";

// The check endpoint is public, so it refuses to run more often than this.
// That keeps anyone hammering it from burning through the ticket API quotas.
const MIN_INTERVAL_MS = 25 * 60 * 1000;
// Sale reminders: one about a day ahead, and one shortly before. The check
// runs hourly (sometimes late), so "shortly before" is a 90-minute window.
const SALE_REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;
const SOON_WINDOW_MS = 90 * 60 * 1000;

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

export type Reminder = { stage: "soon" | "day"; show: Show; label: string; start: string };

// One group per reminder stage, sale type, and local start time; earliest first.
export function groupReminders(due: Reminder[]): Reminder[][] {
  const groups = new Map<string, Reminder[]>();
  for (const r of due) {
    const key = `${r.stage}|${presaleKey(r.label)}|${localKey(r.start, r.show.timezone)}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()].map((g) => g.sort((a, b) => a.start.localeCompare(b.start)));
}

// Reminders before each sale: about a day ahead and again shortly before.
// Shows that open at the same local time share one notification, so a big
// tour doesn't send one per city.
async function sendSaleReminders(userId: string, name: string, artistId: string, shows: Show[], now: number) {
  const due: Reminder[] = [];
  for (const show of shows) {
    for (const sale of upcomingSaleStarts(show, SALE_REMINDER_WINDOW_MS, now)) {
      const base = `${artistId}|${showKey(show)}|${presaleKey(sale.label)}|${sale.start}`;
      if (Date.parse(sale.start) - now <= SOON_WINDOW_MS) {
        const isNew = await firstTime(userId, `sale1h|${base}`);
        await firstTime(userId, `sale|${base}`); // no day-ahead reminder after this one
        if (isNew) due.push({ stage: "soon", show, label: sale.label, start: sale.start });
      } else if (await firstTime(userId, `sale|${base}`)) {
        due.push({ stage: "day", show, label: sale.label, start: sale.start });
      }
    }
  }
  let sent = 0;
  for (const group of groupReminders(due)) {
    const first = group[0];
    const minutes = Math.max(1, Math.round((Date.parse(first.start) - now) / 60000));
    const when =
      first.stage === "soon" ? `starts in ${minutes} min` : `starts in ${Math.round(minutes / 60)} hours`;
    const body =
      group.length === 1
        ? `${fmtDateTime(first.start, first.show.timezone)} · ${place(first.show)}, ${fmtDate(first.show.date)}`
        : `${localKey(first.start, first.show.timezone)} local time · ${group.length} shows · ${place(first.show)} opens first`;
    sent += await sendToUser(userId, {
      title: `${name}: ${first.label} ${when}`,
      body,
      url: `/artists/${artistId}`,
      tag: `sale-${artistId}-${first.stage}-${presaleKey(first.label)}`,
    });
  }
  return sent;
}

// "New presale added" for presales that appear on shows we already knew.
async function sendNewPresaleAlerts(
  userId: string,
  name: string,
  artistId: string,
  entries: { show: Show; presale: { name: string; start: string | null }; key: string }[],
) {
  const fresh = [];
  for (const e of entries) if (await firstTime(userId, `newpresale|${artistId}|${e.key}`)) fresh.push(e);
  const byName = new Map<string, typeof fresh>();
  for (const e of fresh) byName.set(presaleKey(e.presale.name), [...(byName.get(presaleKey(e.presale.name)) ?? []), e]);
  let sent = 0;
  for (const group of byName.values()) {
    group.sort((a, b) => (a.presale.start ?? "").localeCompare(b.presale.start ?? ""));
    const first = group[0];
    sent += await sendToUser(userId, {
      title: `${name}: new presale added`,
      body: `${first.presale.name} · starts ${fmtDateTime(first.presale.start!, first.show.timezone)}${
        group.length > 1 ? ` · ${group.length} shows` : ` · ${place(first.show)}`
      }`,
      url: `/artists/${artistId}`,
      tag: `newpresale-${artistId}-${presaleKey(first.presale.name)}`,
    });
  }
  return sent;
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
  let failures = 0;
  for (const [artistId, { name, users }] of followersByArtist) {
    let shows: Show[];
    try {
      shows = (
        await getShows({ id: artistId, name, imageUrl: null, genre: null, upcomingShows: 0 })
      ).filter((s) => (!s.date || s.date >= today) && s.status !== "cancelled" && s.status !== "offsale" && s.status !== "postponed");
    } catch (err) {
      // Skip this artist this time; one failure shouldn't stop everyone's alerts.
      console.error(`alerts: ${name}`, err);
      failures++;
      continue;
    }

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

    // Presales added to shows we already knew about (e.g. a new fan presale).
    const upcomingPresales = shows.flatMap((show) =>
      realPresales(show)
        .filter((p) => p.start && Date.parse(p.start) > now)
        .map((p) => ({ show, presale: p, key: `${showKey(show)}|${presaleKey(p.name)}` })),
    );
    const knownP = new Set(
      (await db().select().from(knownPresales).where(eq(knownPresales.artistId, artistId))).map((k) => k.presaleKey),
    );
    const unseenPresales = upcomingPresales.filter((e) => !knownP.has(e.key));
    if (unseenPresales.length) {
      await db()
        .insert(knownPresales)
        .values(unseenPresales.map((e) => ({ artistId, presaleKey: e.key })))
        .onConflictDoNothing();
    }
    const presalesSeeded = tracked[0]?.presalesSeeded ?? false;
    if (!presalesSeeded) {
      await db()
        .insert(trackedArtists)
        .values({ artistId, presalesSeeded: true })
        .onConflictDoUpdate({ target: trackedArtists.artistId, set: { presalesSeeded: true } });
    }
    // Only for shows that existed before this run; brand-new shows get their own alert.
    const newPresales = presalesSeeded ? unseenPresales.filter((e) => knownKeys.has(showKey(e.show))) : [];

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
        sent += await sendNewPresaleAlerts(userId, name, artistId, newPresales.filter((e) => relevant(e.show)));
        sent += await sendSaleReminders(userId, name, artistId, shows.filter(relevant), now);
      }
    }
    await sleep(500); // stay well under Ticketmaster's requests-per-second limit
  }

  return { artistsChecked: followersByArtist.size, notificationsSent: sent, failures };
}
