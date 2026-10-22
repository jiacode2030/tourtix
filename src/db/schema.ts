import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// One row per signed-in user who has saved settings. user_id is the Google account ID.
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  city: text("city"),
  region: text("region"),
  zip: text("zip"),
  // Rounded to ~1 km (2 decimals) before saving, for privacy.
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  radiusMiles: integer("radius_miles").notNull().default(100),
  alertNewShows: boolean("alert_new_shows").notNull().default(true),
  alertSales: boolean("alert_sales").notNull().default(true),
  alertNearOnly: boolean("alert_near_only").notNull().default(false),
  // Accounts and cards ticked under "Presales I can get into" (keys from lib/presale-access).
  memberships: text("memberships").array().notNull().default([]),
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
  // Same idea for presales: the first presale check records them silently.
  presalesSeeded: boolean("presales_seeded").notNull().default(false),
});

// Presales we've already seen per show, so newly added ones trigger alerts.
export const knownPresales = pgTable(
  "known_presales",
  {
    artistId: text("artist_id").notNull(),
    // showKey|presaleKey
    presaleKey: text("presale_key").notNull(),
    firstSeen: timestamp("first_seen", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.artistId, t.presaleKey] })],
);

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

// Messages sent through the contact form, read at /admin/messages.
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  reason: text("reason").notNull(),
  email: text("email"),
  message: text("message").notNull(),
  userId: text("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Private concert passport: concerts a user says they went to. Only ever read
// back by their owner. event_date is the day of the concert (no time zone).
export const stamps = pgTable("stamps", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  artistId: text("artist_id"),
  artistName: text("artist_name").notNull(),
  imageUrl: text("image_url"),
  venue: text("venue"),
  city: text("city"),
  eventDate: date("event_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
