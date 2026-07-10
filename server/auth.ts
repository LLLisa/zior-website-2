import crypto from "node:crypto";
import { serialize, parse } from "cookie";
import type { Request, Response, NextFunction } from "express";
import { db, type UserRow } from "./db";
import { config } from "./config";

/** Keyed hash so a leaked DB of token/session hashes can't be used to forge. */
function hash(raw: string): string {
  return crypto.createHmac("sha256", config.sessionSecret).update(raw).digest("hex");
}

function randomToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

// ---- Magic-link login tokens ------------------------------------------------

export function createLoginToken(email: string): string {
  const raw = randomToken();
  db.prepare(
    `INSERT INTO login_tokens (email, token_hash, expires_at) VALUES (?, ?, ?)`,
  ).run(email, hash(raw), Date.now() + config.loginTokenTtlMs);
  return raw;
}

/** Validate + single-use consume a magic-link token, returning the email. */
export function consumeLoginToken(raw: string): string | null {
  const row = db
    .prepare(
      `SELECT id, email, expires_at, used_at FROM login_tokens WHERE token_hash = ?`,
    )
    .get(hash(raw)) as
    | { id: number; email: string; expires_at: number; used_at: number | null }
    | undefined;
  if (!row || row.used_at || row.expires_at < Date.now()) return null;
  db.prepare(`UPDATE login_tokens SET used_at = ? WHERE id = ?`).run(
    Date.now(),
    row.id,
  );
  return row.email;
}

// ---- Sessions ---------------------------------------------------------------

export function createSession(userId: number): string {
  const raw = randomToken();
  db.prepare(
    `INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
  ).run(hash(raw), userId, Date.now() + config.sessionTtlMs, Date.now());
  return raw;
}

export function userForSession(raw: string | undefined): UserRow | null {
  if (!raw) return null;
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > ?`,
    )
    .get(hash(raw), Date.now()) as UserRow | undefined;
  return row ?? null;
}

export function destroySession(raw: string | undefined) {
  if (raw) db.prepare(`DELETE FROM sessions WHERE id = ?`).run(hash(raw));
}

// ---- Cookies ----------------------------------------------------------------

export function sessionCookie(raw: string): string {
  return serialize(config.cookieName, raw, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    path: "/",
    maxAge: Math.floor(config.sessionTtlMs / 1000),
  });
}

export function clearCookie(): string {
  return serialize(config.cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    path: "/",
    maxAge: 0,
  });
}

function readSessionCookie(req: Request): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  return parse(header)[config.cookieName];
}

// ---- Middleware -------------------------------------------------------------

export interface AuthRequest extends Request {
  user?: UserRow;
}

/** Attaches req.user when a valid session exists; never blocks. */
export function withUser(req: AuthRequest, _res: Response, next: NextFunction) {
  const user = userForSession(readSessionCookie(req));
  if (user) req.user = user;
  next();
}

/** Any signed-in (verified) user may edit content. */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }
  next();
}

/** Only admins may reach the wrapped handler. */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }
  if (!req.user.is_admin) {
    res.status(403).json({ error: "Admins only." });
    return;
  }
  next();
}
