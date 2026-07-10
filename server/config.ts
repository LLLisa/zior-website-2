import path from "node:path";
import fs from "node:fs";

const root = process.cwd();

// Load .env if present (Node >= 20.12). No external dependency needed.
try {
  const envFile = path.join(root, ".env");
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
} catch {
  // process.loadEnvFile unavailable or file unreadable — rely on real env vars.
}

export const config = {
  root,
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 1953,
  appUrl: (process.env.APP_URL || "http://localhost:5173").replace(/\/$/, ""),
  sessionSecret: process.env.SESSION_SECRET || "dev-insecure-change-me",
  adminEmail: (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.FROM_EMAIL || "ZIOR <login@zoominonrecovery.org>",

  // Filesystem layout.
  dataDir: path.join(root, "data"),
  uploadsDir: path.join(root, "data", "uploads"),
  dbPath: path.join(root, "data", "zior.db"),
  seedAssetsDir: path.join(root, "seed-assets"),
  distDir: path.join(root, "dist"),
  secretsDir: path.join(root, "secrets"),

  // Auth timings.
  loginTokenTtlMs: 15 * 60 * 1000, // magic link valid for 15 minutes
  sessionTtlMs: 30 * 24 * 60 * 60 * 1000, // session cookie lasts 30 days
  cookieName: "zior_session",
};

export function ensureDirs() {
  for (const dir of [config.dataDir, config.uploadsDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

if (config.isProd && config.sessionSecret === "dev-insecure-change-me") {
  throw new Error(
    "SESSION_SECRET must be set to a strong value in production. See .env.example.",
  );
}
