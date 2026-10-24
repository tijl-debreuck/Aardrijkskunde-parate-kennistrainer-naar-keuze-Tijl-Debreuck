import "dotenv/config";
import pg from "pg";

// PostgreSQL verbinding. DATABASE_URL komt van je host (Neon, Supabase, Render, ...),
// bv. postgres://gebruiker:wachtwoord@host:5432/geotrainer?sslmode=require
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL ontbreekt. Stel deze in via .env of de omgevingsvariabelen van je host.");
}

export const pool = new pg.Pool({
  connectionString,
  max: 10,
});

pool.on("error", (err) => {
  console.error("Onverwachte databasefout:", err);
});

// Maakt de tabellen aan als ze nog niet bestaan. Wordt bij elke serverstart uitgevoerd.
export async function initDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name  TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

    CREATE TABLE IF NOT EXISTS user_data (
      user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      preferences  JSONB NOT NULL DEFAULT '{}'::jsonb,
      geo_stats    JSONB NOT NULL DEFAULT '{}'::jsonb,
      geo_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
      folders      JSONB,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE user_data ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;
    ALTER TABLE user_data ADD COLUMN IF NOT EXISTS consent JSONB;

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash TEXT PRIMARY KEY,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Door de beheerder toegevoegde quizitems, zichtbaar voor alle bezoekers
    CREATE TABLE IF NOT EXISTS custom_items (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      capital    TEXT,
      region     TEXT NOT NULL,
      category   TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Verlopen sessies opruimen
  await pool.query("DELETE FROM sessions WHERE expires_at < now()");
  await pool.query("DELETE FROM admin_sessions WHERE expires_at < now()");
}
