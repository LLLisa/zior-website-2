import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { all, one, run, type DeckRow, type SlideRow } from "../db";
import { getFile, storeFile, deleteFile } from "../files";
import { requireAuth, type AuthRequest } from "../auth";
import { imageUpload } from "../uploads";
import { config } from "../config";
import { fetchJftHtml, parseJftParts, wrapJftLines } from "../jft";

export const decksRouter = Router();
export const slidesRouter = Router();

function slideDto(s: SlideRow) {
  return {
    id: s.id,
    kind: s.kind,
    alt: s.alt,
    position: s.position,
    src: s.file_id ? `/uploads/${s.file_id}` : null,
  };
}

function getDeck(slug: string) {
  return one<DeckRow>(`SELECT * FROM decks WHERE slug = $1`, [slug]);
}

// Render the live Just for Today reading as one or more slides matching the
// deck: the navy background image, a yellow header, and white body text.
async function drawJftPages(pdf: PDFDocument) {
  let parts;
  try {
    parts = parseJftParts(await fetchJftHtml());
  } catch {
    parts = {
      heading: "JUST FOR TODAY",
      title: "",
      bodyText: "The daily meditation is unavailable right now.",
    };
  }
  const W = 1280;
  const H = 720;
  const margin = 90;
  const body = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const yellow = rgb(1, 1, 0);
  const white = rgb(1, 1, 1);

  let bg: Awaited<ReturnType<typeof pdf.embedJpg>> | null = null;
  try {
    bg = await pdf.embedJpg(
      fs.readFileSync(path.join(config.root, "public", "jft-bg.jpg")),
    );
  } catch {
    // fall back to a flat navy fill below
  }
  const newPage = () => {
    const page = pdf.addPage([W, H]);
    if (bg) page.drawImage(bg, { x: 0, y: 0, width: W, height: H });
    else page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.04, 0.1, 0.17) });
    return page;
  };

  let page = newPage();
  let y = H - margin;
  const centered = (text: string, size: number, color: typeof white) => {
    const w = bold.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (W - w) / 2, y, size, font: bold, color });
    y -= size * 1.4;
  };
  centered(parts.heading, 34, yellow);
  if (parts.title) centered(parts.title, 26, white);
  y -= 12;

  // Fit the whole reading below the headers on this single page.
  const availableH = y - margin;
  let size = 20;
  let lines: string[] = [];
  for (; size > 8; size--) {
    lines = wrapJftLines(
      parts.bodyText,
      (s) => body.widthOfTextAtSize(s, size),
      W - margin * 2,
    );
    if (lines.length * size * 1.35 <= availableH) break;
  }
  const lineH = size * 1.35;
  for (const line of lines) {
    if (line) page.drawText(line, { x: margin, y, size, font: body, color: white });
    y -= lineH;
  }
}

function getSlides(slug: string) {
  return all<SlideRow>(
    `SELECT * FROM slides WHERE deck_slug = $1 ORDER BY position, id`,
    [slug],
  );
}

decksRouter.get("/", async (_req, res) => {
  const decks = await all<DeckRow>(`SELECT * FROM decks ORDER BY slug`);
  const out = [];
  for (const d of decks) {
    out.push({
      slug: d.slug,
      title: d.title,
      slides: (await getSlides(d.slug)).map(slideDto),
    });
  }
  res.json(out);
});

decksRouter.get("/:slug", async (req, res) => {
  const deck = await getDeck(req.params.slug);
  if (!deck) {
    res.status(404).json({ error: "Deck not found." });
    return;
  }
  res.json({
    slug: deck.slug,
    title: deck.title,
    slides: (await getSlides(deck.slug)).map(slideDto),
  });
});

// Public: download the whole deck as a single PDF (one slide per page).
decksRouter.get("/:slug/download", async (req, res) => {
  const deck = await getDeck(req.params.slug);
  if (!deck) {
    res.status(404).json({ error: "Deck not found." });
    return;
  }
  const slides = await getSlides(deck.slug);
  const pdf = await PDFDocument.create();
  for (const slide of slides) {
    if (slide.kind === "jft") {
      await drawJftPages(pdf);
      continue;
    }
    if (!slide.file_id) continue;
    const file = await getFile(slide.file_id);
    if (!file) continue;
    let img;
    try {
      if (file.mime === "image/png") img = await pdf.embedPng(file.data);
      else if (file.mime === "image/jpeg") img = await pdf.embedJpg(file.data);
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
  async (req: AuthRequest, res) => {
    const deck = await getDeck(req.params.slug);
    if (!deck) {
      res.status(404).json({ error: "Deck not found." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "An image file is required." });
      return;
    }
    const fileId = await storeFile(req.file.mimetype, req.file.buffer);
    const next = await one<{ p: number }>(
      `SELECT COALESCE(MAX(position) + 1, 0) AS p FROM slides WHERE deck_slug = $1`,
      [deck.slug],
    );
    const slide = await one<SlideRow>(
      `INSERT INTO slides (deck_slug, file_id, alt, position)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [deck.slug, fileId, String(req.body?.alt || ""), next!.p],
    );
    res.status(201).json(slideDto(slide!));
  },
);

// Add the special "Just for Today" text slide (only one allowed per deck).
decksRouter.post("/:slug/jft-slide", requireAuth, async (req, res) => {
  const deck = await getDeck(req.params.slug);
  if (!deck) {
    res.status(404).json({ error: "Deck not found." });
    return;
  }
  const existing = await one<SlideRow>(
    `SELECT * FROM slides WHERE deck_slug = $1 AND kind = 'jft'`,
    [deck.slug],
  );
  if (existing) {
    res.status(409).json({ error: "This deck already has a Just for Today slide." });
    return;
  }
  const next = await one<{ p: number }>(
    `SELECT COALESCE(MAX(position) + 1, 0) AS p FROM slides WHERE deck_slug = $1`,
    [deck.slug],
  );
  const slide = await one<SlideRow>(
    `INSERT INTO slides (deck_slug, file_id, alt, position, kind)
     VALUES ($1, NULL, 'Just for Today', $2, 'jft') RETURNING *`,
    [deck.slug, next!.p],
  );
  res.status(201).json(slideDto(slide!));
});

// Reorder a deck's slides given an array of slide ids in the new order.
decksRouter.put("/:slug/order", requireAuth, async (req: AuthRequest, res) => {
  const deck = await getDeck(req.params.slug);
  if (!deck) {
    res.status(404).json({ error: "Deck not found." });
    return;
  }
  const ids = Array.isArray(req.body?.order) ? req.body.order : null;
  if (!ids) {
    res.status(400).json({ error: "order must be an array of slide ids." });
    return;
  }
  for (let i = 0; i < ids.length; i++) {
    await run(`UPDATE slides SET position = $1 WHERE id = $2 AND deck_slug = $3`, [
      i,
      ids[i],
      deck.slug,
    ]);
  }
  res.json({ slides: (await getSlides(deck.slug)).map(slideDto) });
});

slidesRouter.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const slide = await one<SlideRow>(`SELECT * FROM slides WHERE id = $1`, [
    req.params.id,
  ]);
  if (!slide) {
    res.status(404).json({ error: "Slide not found." });
    return;
  }
  const alt = String(req.body?.alt ?? "");
  await run(`UPDATE slides SET alt = $1 WHERE id = $2`, [alt, slide.id]);
  res.json(slideDto({ ...slide, alt }));
});

slidesRouter.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const slide = await one<SlideRow>(`SELECT * FROM slides WHERE id = $1`, [
    req.params.id,
  ]);
  if (!slide) {
    res.status(404).json({ error: "Slide not found." });
    return;
  }
  await run(`DELETE FROM slides WHERE id = $1`, [slide.id]);
  if (slide.file_id) await deleteFile(slide.file_id);
  res.json({ ok: true });
});
