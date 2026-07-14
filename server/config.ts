import path from "node:path";
import fs from "node:fs";

const root = process.cwd();

// Load .env if present (no external dependency). Real environment variables
// take precedence — .env only fills in gaps — so that Docker/Heroku/shell env
// stays authoritative (e.g. the DB host Compose injects isn't overridden by a
// stale .env). There is no .env on Heroku, so real platform env vars are used.
try {
  const envFile = path.join(root, ".env");
  if (fs.existsSync(envFile)) {
    for (const raw of fs.readFileSync(envFile, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
} catch {
  // .env unreadable — rely on real env vars.
}

const databaseUrl =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/zior_db";

// Heroku Postgres (and most managed providers) require SSL; local ones don't.
// DATABASE_SSL overrides the heuristic — needed for the dockerized Postgres,
// whose host ("db") isn't localhost but still speaks plain TCP.
const isLocalDb = /@(localhost|127\.0\.0\.1)/.test(databaseUrl);
const sslEnv = (process.env.DATABASE_SSL || "").toLowerCase();
const useSsl =
  sslEnv === "false" || sslEnv === "disable" || sslEnv === "0"
    ? false
    : sslEnv === "true" || sslEnv === "require" || sslEnv === "1"
      ? true
      : !isLocalDb;

export const config = {
  root,
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 1953,
  appUrl: (process.env.APP_URL || "http://localhost:5173").replace(/\/$/, ""),
  // Deployed site the cms-sync tool pulls CMS content from (public GETs only).
  remoteUrl: (process.env.REMOTE_URL || "https://zoominonrecovery.org").replace(
    /\/$/,
    "",
  ),
  sessionSecret: process.env.SESSION_SECRET || "dev-insecure-change-me",
  adminEmail: (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.FROM_EMAIL || "ZIOR <login@zoominonrecovery.org>",

  databaseUrl,
  dbSsl: useSsl ? { rejectUnauthorized: false } : false,

  // Filesystem layout (assets bundled with the app; no runtime writes needed).
  seedAssetsDir: path.join(root, "seed-assets"),
  distDir: path.join(root, "dist"),
  secretsDir: path.join(root, "secrets"),

  // Auth timings.
  loginTokenTtlMs: 60 * 60 * 1000, // magic link valid for 1 hour
  sessionTtlMs: 30 * 24 * 60 * 60 * 1000, // session cookie lasts 30 days
  cookieName: "zior_session",
};

if (config.isProd && config.sessionSecret === "dev-insecure-change-me") {
  throw new Error(
    "SESSION_SECRET must be set to a strong value in production. See .env.example.",
  );
}
