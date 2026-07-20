import { Router, type Response } from "express";
import { all, run } from "../db";
import { storeFile, deleteFile } from "../files";
import { requireAdmin, type AuthRequest } from "../auth";
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
  // seed_completed_at is an internal seed marker, not a public setting.
  const { qr_file_id, seventh_tradition_file_id, seed_completed_at, ...rest } =
    s;
  void seed_completed_at;
  return {
    ...rest,
    qrUrl: qr_file_id ? `/uploads/${qr_file_id}` : null,
    seventhTraditionUrl: seventh_tradition_file_id
      ? `/uploads/${seventh_tradition_file_id}`
      : null,
  };
}

settingsRouter.get("/", async (_req, res) => {
  res.json(toDto(await readSettings()));
});

settingsRouter.put("/", requireAdmin, async (req: AuthRequest, res) => {
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

// Upload/replace a single named image stored in settings (key -> file id).
function putImage(settingKey: string) {
  return async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "An image file is required." });
      return;
    }
    const previous = (await readSettings())[settingKey];
    const fileId = await storeFile(req.file.mimetype, req.file.buffer);
    await run(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
      [settingKey, fileId],
    );
    if (previous && previous !== fileId) await deleteFile(previous);
    res.json(toDto(await readSettings()));
  };
}

// Remove a single named image.
function removeImage(settingKey: string) {
  return async (_req: AuthRequest, res: Response) => {
    const previous = (await readSettings())[settingKey];
    await run(`DELETE FROM settings WHERE key = $1`, [settingKey]);
    if (previous) await deleteFile(previous);
    res.json(toDto(await readSettings()));
  };
}

// Replace the QR code image.
settingsRouter.put(
  "/qr",
  requireAdmin,
  imageUpload.single("image"),
  putImage("qr_file_id"),
);

// The 7th Tradition slide shown below the text on that page.
settingsRouter.put(
  "/seventh-tradition",
  requireAdmin,
  imageUpload.single("image"),
  putImage("seventh_tradition_file_id"),
);
settingsRouter.delete(
  "/seventh-tradition",
  requireAdmin,
  removeImage("seventh_tradition_file_id"),
);
