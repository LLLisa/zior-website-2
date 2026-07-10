import { Router } from "express";
import { all, one, run, type ScriptRow } from "../db";
import { getFile, storeFile, deleteFile } from "../files";
import { requireAuth, type AuthRequest } from "../auth";
import { pdfUpload } from "../uploads";

export const scriptsRouter = Router();

function scriptDto(s: ScriptRow) {
  return {
    slug: s.slug,
    title: s.title,
    hasFile: !!s.file_id,
    updatedAt: s.updated_at,
    fileUrl: s.file_id ? `/api/scripts/${s.slug}/file` : null,
  };
}

function getScript(slug: string) {
  return one<ScriptRow>(`SELECT * FROM scripts WHERE slug = $1`, [slug]);
}

scriptsRouter.get("/", async (_req, res) => {
  const rows = await all<ScriptRow>(`SELECT * FROM scripts ORDER BY slug`);
  res.json(rows.map(scriptDto));
});

scriptsRouter.get("/:slug", async (req, res) => {
  const s = await getScript(req.params.slug);
  if (!s) {
    res.status(404).json({ error: "Script not found." });
    return;
  }
  res.json(scriptDto(s));
});

// Public: view inline (?download=1 forces a download). Used by both the
// in-page PDF viewer and the public "Download" button.
scriptsRouter.get("/:slug/file", async (req, res) => {
  const s = await getScript(req.params.slug);
  if (!s || !s.file_id) {
    res.status(404).json({ error: "No script available." });
    return;
  }
  const file = await getFile(s.file_id);
  if (!file) {
    res.status(404).json({ error: "No script available." });
    return;
  }
  const disposition = req.query.download ? "attachment" : "inline";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename="${s.slug}-script.pdf"`,
  );
  res.end(file.data);
});

// Any verified user may replace the script PDF.
scriptsRouter.put(
  "/:slug",
  requireAuth,
  pdfUpload.single("pdf"),
  async (req: AuthRequest, res) => {
    const s = await getScript(req.params.slug);
    if (!s) {
      res.status(404).json({ error: "Script not found." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "A PDF file is required." });
      return;
    }
    const fileId = await storeFile(req.file.mimetype, req.file.buffer);
    await run(
      `UPDATE scripts SET file_id = $1, updated_at = now(), updated_by = $2
       WHERE slug = $3`,
      [fileId, req.user!.email, s.slug],
    );
    await deleteFile(s.file_id);
    res.json(scriptDto((await getScript(s.slug))!));
  },
);
