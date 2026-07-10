import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { db, type ScriptRow } from "../db";
import { config } from "../config";
import { requireAuth, type AuthRequest } from "../auth";
import { pdfUpload } from "../uploads";

export const scriptsRouter = Router();

const uploadPath = (filename: string) =>
  path.join(config.uploadsDir, path.basename(filename));

function scriptDto(s: ScriptRow) {
  return {
    slug: s.slug,
    title: s.title,
    hasFile: !!s.filename,
    updatedAt: s.updated_at,
    fileUrl: s.filename ? `/api/scripts/${s.slug}/file` : null,
  };
}

function getScript(slug: string): ScriptRow | undefined {
  return db.prepare(`SELECT * FROM scripts WHERE slug = ?`).get(slug) as
    | ScriptRow
    | undefined;
}

scriptsRouter.get("/", (_req, res) => {
  const rows = db.prepare(`SELECT * FROM scripts ORDER BY slug`).all() as ScriptRow[];
  res.json(rows.map(scriptDto));
});

scriptsRouter.get("/:slug", (req, res) => {
  const s = getScript(req.params.slug);
  if (!s) {
    res.status(404).json({ error: "Script not found." });
    return;
  }
  res.json(scriptDto(s));
});

// Public: view inline (?download=1 forces a download). Used by both the
// in-page PDF viewer and the public "Download" button.
scriptsRouter.get("/:slug/file", (req, res) => {
  const s = getScript(req.params.slug);
  if (!s || !s.filename) {
    res.status(404).json({ error: "No script available." });
    return;
  }
  const file = uploadPath(s.filename);
  if (!fs.existsSync(file)) {
    res.status(404).json({ error: "No script available." });
    return;
  }
  const disposition = req.query.download ? "attachment" : "inline";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename="${s.slug}-script.pdf"`,
  );
  fs.createReadStream(file).pipe(res);
});

// Any verified user may replace the script PDF.
scriptsRouter.put(
  "/:slug",
  requireAuth,
  pdfUpload.single("pdf"),
  (req: AuthRequest, res) => {
    const s = getScript(req.params.slug);
    if (!s) {
      res.status(404).json({ error: "Script not found." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "A PDF file is required." });
      return;
    }
    const previous = s.filename;
    db.prepare(
      `UPDATE scripts SET filename = ?, updated_at = datetime('now'), updated_by = ?
       WHERE slug = ?`,
    ).run(req.file.filename, req.user!.email, s.slug);
    if (previous && previous !== req.file.filename) {
      fs.rmSync(uploadPath(previous), { force: true });
    }
    res.json(scriptDto(getScript(s.slug)!));
  },
);
