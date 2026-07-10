import { Router } from "express";
import { all, run } from "../db";
import { storeFile, deleteFile } from "../files";
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

async function readSettings(): Promise<Record<string, string>> {
  const rows = await all<{ key: string; value: string }>(
    `SELECT key, value FROM settings`,
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

function toDto(s: Record<string, string>) {
  const { qr_file_id, ...rest } = s;
  return { ...rest, qrUrl: qr_file_id ? `/uploads/${qr_file_id}` : null };
}

settingsRouter.get("/", async (_req, res) => {
  res.json(toDto(await readSettings()));
});

settingsRouter.put("/", requireAuth, async (req: AuthRequest, res) => {
  const body = req.body ?? {};
  for (const key of Object.keys(body)) {
    if (!EDITABLE.has(key)) continue;
    await run(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
      [key, String(body[key] ?? "")],
    );
  }
  res.json(toDto(await readSettings()));
});

// Replace the QR code image.
settingsRouter.put(
  "/qr",
  requireAuth,
  imageUpload.single("image"),
  async (req: AuthRequest, res) => {
    if (!req.file) {
      res.status(400).json({ error: "An image file is required." });
      return;
    }
    const previous = (await readSettings()).qr_file_id;
    const fileId = await storeFile(req.file.mimetype, req.file.buffer);
    await run(
      `INSERT INTO settings (key, value) VALUES ('qr_file_id', $1)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
      [fileId],
    );
    if (previous && previous !== fileId) await deleteFile(previous);
    res.json(toDto(await readSettings()));
  },
);
