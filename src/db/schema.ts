import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

// One row per signed-in user who has saved settings. user_id is Clerk's ID.
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  city: text("city"),
  region: text("region"),
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
