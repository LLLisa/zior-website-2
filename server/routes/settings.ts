import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { db } from "../db";
import { config } from "../config";
import { requireAuth, type AuthRequest } from "../auth";
import { imageUpload } from "../uploads";

export const settingsRouter = Router();

// Text settings a verified user may edit.
const EDITABLE = new Set([
  "site_title",
  "zoom_url",
  "meeting_start",
  "meeting_end",
  "meeting_tz",
  "calendar_embed_src",
]);

function readSettings(): Record<string, string> {
  const rows = db.prepare(`SELECT key, value FROM settings`).all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

function toDto(s: Record<string, string>) {
  const { qr_filename, ...rest } = s;
  return { ...rest, qrUrl: qr_filename ? `/uploads/${qr_filename}` : null };
}

settingsRouter.get("/", (_req, res) => {
  res.json(toDto(readSettings()));
});

settingsRouter.put("/", requireAuth, (req: AuthRequest, res) => {
  const body = req.body ?? {};
  const upsert = db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  );
  db.transaction(() => {
    for (const key of Object.keys(body)) {
      if (EDITABLE.has(key)) upsert.run(key, String(body[key] ?? ""));
    }
  })();
  res.json(toDto(readSettings()));
});

// Replace the QR code image.
settingsRouter.put(
  "/qr",
  requireAuth,
  imageUpload.single("image"),
  (req: AuthRequest, res) => {
    if (!req.file) {
      res.status(400).json({ error: "An image file is required." });
      return;
    }
    const previous = (readSettings().qr_filename || "").trim();
    db.prepare(
      `INSERT INTO settings (key, value) VALUES ('qr_filename', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ).run(req.file.filename);
    if (previous && previous !== req.file.filename) {
      fs.rmSync(path.join(config.uploadsDir, path.basename(previous)), {
        force: true,
      });
    }
    res.json(toDto(readSettings()));
  },
);
