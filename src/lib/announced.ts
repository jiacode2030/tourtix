import { sql } from "drizzle-orm";
import { db } from "@/db";

export type Announcement = { artistId: string; artistName: string; newShows: number; latest: Date };

// Artists with shows first seen in the last `days` days. Only counts shows
// found after an artist's first (silent) check, so following an artist
// doesn't make their whole existing tour look "just announced". Coverage is
// limited to artists the alert job tracks.
export async function justAnnounced(days = 7, limit = 8): Promise<Announcement[]> {
  try {
    const rows = await db().execute(sql`
      SELECT k.artist_id AS "artistId",
             (SELECT f.artist_name FROM favorites f WHERE f.artist_id = k.artist_id LIMIT 1) AS "artistName",
             count(*)::int AS "newShows",
             max(k.first_seen) AS "latest"
      FROM known_shows k
      JOIN tracked_artists t ON t.artist_id = k.artist_id
      WHERE k.first_seen > t.seeded_at + interval '1 hour'
        AND k.first_seen > now() - make_interval(days => ${days})
      GROUP BY k.artist_id
      ORDER BY max(k.first_seen) DESC
      LIMIT ${limit}
    `);
    return (rows.rows as Announcement[])
      .filter((r) => r.artistName)
      .map((r) => ({ ...r, latest: new Date(r.latest) }));
  } catch (err) {
    console.error(err);
    return [];
  }
}
