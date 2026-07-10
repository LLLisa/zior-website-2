import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { PDFDocument } from "pdf-lib";
import { db, type DeckRow, type SlideRow } from "../db";
import { config } from "../config";
import { requireAuth, type AuthRequest } from "../auth";
import { imageUpload } from "../uploads";

export const decksRouter = Router();
export const slidesRouter = Router();

const uploadPath = (filename: string) =>
  path.join(config.uploadsDir, path.basename(filename));

function slideDto(s: SlideRow) {
  return { id: s.id, alt: s.alt, position: s.position, src: `/uploads/${s.filename}` };
}

function getDeck(slug: string): DeckRow | undefined {
  return db.prepare(`SELECT * FROM decks WHERE slug = ?`).get(slug) as
    | DeckRow
    | undefined;
}

function getSlides(slug: string): SlideRow[] {
  return db
    .prepare(`SELECT * FROM slides WHERE deck_slug = ? ORDER BY position, id`)
    .all(slug) as SlideRow[];
}

decksRouter.get("/", (_req, res) => {
  const decks = db.prepare(`SELECT * FROM decks ORDER BY slug`).all() as DeckRow[];
  res.json(
    decks.map((d) => ({
      slug: d.slug,
      title: d.title,
      slides: getSlides(d.slug).map(slideDto),
    })),
  );
});

decksRouter.get("/:slug", (req, res) => {
  const deck = getDeck(req.params.slug);
  if (!deck) {
    res.status(404).json({ error: "Deck not found." });
    return;
  }
  res.json({
    slug: deck.slug,
    title: deck.title,
    slides: getSlides(deck.slug).map(slideDto),
  });
});

// Public: download the whole deck as a single PDF (one slide per page).
decksRouter.get("/:slug/download", async (req, res) => {
  const deck = getDeck(req.params.slug);
  if (!deck) {
    res.status(404).json({ error: "Deck not found." });
    return;
  }
  const slides = getSlides(deck.slug);
  const pdf = await PDFDocument.create();
  for (const slide of slides) {
    const file = uploadPath(slide.filename);
    if (!fs.existsSync(file)) continue;
    const bytes = fs.readFileSync(file);
    const ext = path.extname(slide.filename).toLowerCase();
    let img;
    try {
      if (ext === ".png") img = await pdf.embedPng(bytes);
      else if (ext === ".jpg" || ext === ".jpeg") img = await pdf.embedJpg(bytes);
      else continue; // pdf-lib only embeds PNG/JPEG
    } catch {
      continue;
    }
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  if (pdf.getPageCount() === 0) pdf.addPage([612, 792]);
  const out = await pdf.save();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${deck.slug}-slides.pdf"`,
  );
  res.end(Buffer.from(out));
});

// Add a slide to the end of the deck.
decksRouter.post(
  "/:slug/slides",
  requireAuth,
  imageUpload.single("image"),
  (req: AuthRequest, res) => {
    const deck = getDeck(req.params.slug);
    if (!deck) {
      res.status(404).json({ error: "Deck not found." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "An image file is required." });
      return;
    }
    const next = db
      .prepare(
        `SELECT COALESCE(MAX(position) + 1, 0) AS p FROM slides WHERE deck_slug = ?`,
      )
      .get(deck.slug) as { p: number };
    const info = db
      .prepare(
        `INSERT INTO slides (deck_slug, filename, alt, position) VALUES (?, ?, ?, ?)`,
      )
      .run(deck.slug, req.file.filename, String(req.body?.alt || ""), next.p);
    const slide = db
      .prepare(`SELECT * FROM slides WHERE id = ?`)
      .get(info.lastInsertRowid) as SlideRow;
    res.status(201).json(slideDto(slide));
  },
);

// Reorder a deck's slides given an array of slide ids in the new order.
decksRouter.put("/:slug/order", requireAuth, (req: AuthRequest, res) => {
  const deck = getDeck(req.params.slug);
  if (!deck) {
    res.status(404).json({ error: "Deck not found." });
    return;
  }
  const ids = Array.isArray(req.body?.order) ? req.body.order : null;
  if (!ids) {
    res.status(400).json({ error: "order must be an array of slide ids." });
    return;
  }
  const update = db.prepare(
    `UPDATE slides SET position = ? WHERE id = ? AND deck_slug = ?`,
  );
  db.transaction(() => {
    ids.forEach((id: number, i: number) => update.run(i, id, deck.slug));
  })();
  res.json({ slides: getSlides(deck.slug).map(slideDto) });
});

slidesRouter.patch("/:id", requireAuth, (req: AuthRequest, res) => {
  const slide = db
    .prepare(`SELECT * FROM slides WHERE id = ?`)
    .get(req.params.id) as SlideRow | undefined;
  if (!slide) {
    res.status(404).json({ error: "Slide not found." });
    return;
  }
  db.prepare(`UPDATE slides SET alt = ? WHERE id = ?`).run(
    String(req.body?.alt ?? ""),
    slide.id,
  );
  res.json(slideDto({ ...slide, alt: String(req.body?.alt ?? "") }));
});

slidesRouter.delete("/:id", requireAuth, (req: AuthRequest, res) => {
  const slide = db
    .prepare(`SELECT * FROM slides WHERE id = ?`)
    .get(req.params.id) as SlideRow | undefined;
  if (!slide) {
    res.status(404).json({ error: "Slide not found." });
    return;
  }
  db.prepare(`DELETE FROM slides WHERE id = ?`).run(slide.id);
  // Remove the underlying file unless another slide still references it.
  const stillUsed = db
    .prepare(`SELECT 1 FROM slides WHERE filename = ? LIMIT 1`)
    .get(slide.filename);
  if (!stillUsed) fs.rmSync(uploadPath(slide.filename), { force: true });
  res.json({ ok: true });
});
