import Database from "better-sqlite3";
import { config, ensureDirs } from "./config";

ensureDirs();

export const db = new Database(config.dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    is_admin   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS login_tokens (
    id         INTEGER PRIMARY KEY,
    email      TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    used_at    INTEGER
  );

  -- id is the SHA-256 hash of the random token held in the session cookie.
  CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pages (
    slug       TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    body_html  TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by TEXT
  );

  CREATE TABLE IF NOT EXISTS decks (
    slug  TEXT PRIMARY KEY,
    title TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS slides (
    id        INTEGER PRIMARY KEY,
    deck_slug TEXT NOT NULL REFERENCES decks(slug) ON DELETE CASCADE,
    filename  TEXT NOT NULL,
    alt       TEXT NOT NULL DEFAULT '',
    position  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scripts (
    slug       TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    filename   TEXT,
    updated_at TEXT,
    updated_by TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

export type UserRow = {
  id: number;
  email: string;
  is_admin: number;
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
  filename: string;
  alt: string;
  position: number;
};

export type ScriptRow = {
  slug: string;
  title: string;
  filename: string | null;
  updated_at: string | null;
  updated_by: string | null;
};
