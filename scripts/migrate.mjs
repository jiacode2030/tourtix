// Creates the database tables if they don't exist yet. Runs before every
// build on Vercel; every statement is safe to run repeatedly. Keep in sync
// with src/db/schema.ts.
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("migrate: DATABASE_URL not set, skipping");
  process.exit(0);
}

const sql = neon(url);
await sql`
  CREATE TABLE IF NOT EXISTS profiles (
    user_id text PRIMARY KEY,
    city text,
    region text,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS favorites (
    user_id text NOT NULL,
    artist_id text NOT NULL,
    artist_name text NOT NULL,
    image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, artist_id)
  )`;
await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alert_new_shows boolean NOT NULL DEFAULT true`;
await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alert_sales boolean NOT NULL DEFAULT true`;
await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alert_near_only boolean NOT NULL DEFAULT false`;
await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lat double precision`;
await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lng double precision`;
await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS radius_miles integer NOT NULL DEFAULT 100`;
await sql`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    endpoint text PRIMARY KEY,
    user_id text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS known_shows (
    artist_id text NOT NULL,
    show_key text NOT NULL,
    first_seen timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (artist_id, show_key)
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS tracked_artists (
    artist_id text PRIMARY KEY,
    seeded_at timestamptz NOT NULL DEFAULT now()
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS sent_alerts (
    user_id text NOT NULL,
    alert_key text NOT NULL,
    sent_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, alert_key)
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS app_state (
    key text PRIMARY KEY,
    value text NOT NULL
  )`;
console.log("migrate: tables ready");
