import crypto from "node:crypto";
import pg from "pg";
import { config } from "./config";

// bigint (int8) columns hold epoch-millisecond timestamps; parse them as
// numbers instead of the default strings.
pg.types.setTypeParser(20, (v) => (v === null ? null : Number(v)));

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.dbSsl,
  max: 10,
});

// Managed Postgres (Heroku) drops idle connections; without this handler the
// resulting 'error' event on an idle client would crash the process.
pool.on("error", (err) => {
  console.error("Unexpected idle Postgres client error:", err.message);
});

export async function all<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export async function one<T>(
  text: string,
  params: unknown[] = [],
): Promise<T | undefined> {
  const res = await pool.query(text, params);
  return res.rows[0] as T | undefined;
}

export async function run(text: string, params: unknown[] = []): Promise<void> {
  await pool.query(text, params);
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      email      TEXT NOT NULL UNIQUE,
      name       TEXT NOT NULL DEFAULT '',
      is_admin   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS login_tokens (
      id         SERIAL PRIMARY KEY,
      email      TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at BIGINT NOT NULL,
      used_at    BIGINT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id         TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at BIGINT NOT NULL,
      created_at BIGINT NOT NULL
    );

    -- Uploaded binaries (slide images, script PDFs, QR code) live here so the
    -- app needs no writable filesystem (Heroku dynos are ephemeral).
    CREATE TABLE IF NOT EXISTS files (
      id         TEXT PRIMARY KEY,
      mime       TEXT NOT NULL,
      data       BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS pages (
      slug       TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      body_html  TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_by TEXT
    );

    CREATE TABLE IF NOT EXISTS decks (
      slug  TEXT PRIMARY KEY,
      title TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS slides (
      id        SERIAL PRIMARY KEY,
      deck_slug TEXT NOT NULL REFERENCES decks(slug) ON DELETE CASCADE,
      file_id   TEXT REFERENCES files(id),
      alt       TEXT NOT NULL DEFAULT '',
      position  INTEGER NOT NULL,
      kind      TEXT NOT NULL DEFAULT 'image',
      hash      TEXT
    );

    CREATE TABLE IF NOT EXISTS scripts (
      slug       TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      file_id    TEXT REFERENCES files(id),
      updated_at TIMESTAMPTZ,
      updated_by TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Migrations for databases created before these columns existed. A "jft" slide
  // shows the live Just for Today reading and has no uploaded file.
  await pool.query(
    `ALTER TABLE slides ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'image'`,
  );
  await pool.query(`ALTER TABLE slides ALTER COLUMN file_id DROP NOT NULL`);
  // Content hash of each slide's image, so a remote sync can tell which slides
  // changed without downloading them. Backfilled by backfillSlideHashes().
  await pool.query(`ALTER TABLE slides ADD COLUMN IF NOT EXISTS hash TEXT`);
  // A display name for each user; sign-in still only uses the email.
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`,
  );

  // Keep the table count low (Heroku essential-0 caps rows): drop expired auth rows.
  await pool.query(`DELETE FROM sessions WHERE expires_at < $1`, [Date.now()]);
  await pool.query(`DELETE FROM login_tokens WHERE expires_at < $1`, [Date.now()]);
}

/**
 * Fill in slides.hash for image slides created before the column existed (or by
 * the seed, which inserts without a hash). Runs once per boot; a no-op when all
 * image slides already have a hash.
 */
export async function backfillSlideHashes(): Promise<void> {
  const rows = await all<{ id: number; data: Buffer }>(
    `SELECT s.id, f.data
       FROM slides s JOIN files f ON f.id = s.file_id
      WHERE s.file_id IS NOT NULL AND s.hash IS NULL`,
  );
  for (const r of rows) {
    const hash = crypto.createHash("sha256").update(r.data).digest("hex");
    await run(`UPDATE slides SET hash = $1 WHERE id = $2`, [hash, r.id]);
  }
}

export type UserRow = {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
};

export type PageRow = {
  slug: string;
  title: string;
  body_html: string;
  updated_at: string;
  updated_by: string | null;
};

export type DeckRow = { slug: string; title: string };

export type SlideRow = {
  id: number;
  deck_slug: string;
  file_id: string | null;
  alt: string;
  position: number;
  kind: "image" | "jft";
  hash: string | null;
};

export type ScriptRow = {
  slug: string;
  title: string;
  file_id: string | null;
  updated_at: string | null;
  updated_by: string | null;
};
