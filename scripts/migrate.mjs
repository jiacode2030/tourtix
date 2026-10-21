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
console.log("migrate: tables ready");
