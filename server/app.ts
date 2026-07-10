import express from "express";
import path from "node:path";
import fs from "node:fs";
import { config } from "./config";
import { withUser } from "./auth";
import { authRouter } from "./routes/auth";
import { filesRouter } from "./routes/files";
import { pagesRouter } from "./routes/pages";
import { decksRouter, slidesRouter } from "./routes/decks";
import { scriptsRouter } from "./routes/scripts";
import { settingsRouter } from "./routes/settings";
import { usersRouter } from "./routes/users";
import { jftRouter } from "./routes/jft";

// Canonical hostname derived from APP_URL (e.g. "zoominonrecovery.org").
const canonicalHost = (() => {
  try {
    return new URL(config.appUrl).hostname;
  } catch {
    return "";
  }
})();

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", true); // behind Heroku's router
  app.use(express.json({ limit: "1mb" }));

  // Redirect the www subdomain to the canonical (apex) host.
  if (canonicalHost && !canonicalHost.startsWith("www.")) {
    app.use((req, res, next) => {
      if (req.hostname === `www.${canonicalHost}`) {
        res.redirect(301, `${config.appUrl}${req.originalUrl}`);
        return;
      }
      next();
    });
  }

  app.use(withUser);

  // Uploaded media (slide images, QR code) served from Postgres.
  app.use("/uploads", filesRouter);

  app.use("/auth", authRouter);
  app.use("/jftText", jftRouter);
  app.use("/api/pages", pagesRouter);
  app.use("/api/decks", decksRouter);
  app.use("/api/slides", slidesRouter);
  app.use("/api/scripts", scriptsRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/users", usersRouter);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // In production, serve the built SPA and hand all non-API routes to index.html.
  if (config.isProd && fs.existsSync(config.distDir)) {
    app.use(express.static(config.distDir, { index: false }));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/auth/")) {
        next();
        return;
      }
      res.sendFile(path.join(config.distDir, "index.html"));
    });
  }

  return app;
}
