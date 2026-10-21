import { boolean, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

// One row per signed-in user who has saved settings. user_id is Clerk's ID.
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  city: text("city"),
  region: text("region"),
  alertNewShows: boolean("alert_new_shows").notNull().default(true),
  alertSales: boolean("alert_sales").notNull().default(true),
  alertNearOnly: boolean("alert_near_only").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id").notNull(),
    artistId: text("artist_id").notNull(),
    artistName: text("artist_name").notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.artistId] })],
);

// One row per browser/device that turned on notifications.
export const pushSubscriptions = pgTable("push_subscriptions", {
  endpoint: text("endpoint").primaryKey(),
  userId: text("user_id").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Shows we've already seen per artist, so only new ones trigger alerts.
// show_key is date|city, which stays stable across ticket sellers.
export const knownShows = pgTable(
  "known_shows",
  {
    artistId: text("artist_id").notNull(),
    showKey: text("show_key").notNull(),
    firstSeen: timestamp("first_seen", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.artistId, t.showKey] })],
);

// Artists whose current shows have been recorded once. The first check of
// an artist records shows silently instead of announcing them all as new.
export const trackedArtists = pgTable("tracked_artists", {
  artistId: text("artist_id").primaryKey(),
  seededAt: timestamp("seeded_at", { withTimezone: true }).notNull().defaultNow(),
});

// Every alert sent, so each one goes out once per user.
export const sentAlerts = pgTable(
  "sent_alerts",
  {
    userId: text("user_id").notNull(),
    alertKey: text("alert_key").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.alertKey] })],
);

// Small key/value store: the generated VAPID keys and the last check time.
export const appState = pgTable("app_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
