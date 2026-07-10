import { Router } from "express";
import { db, type PageRow } from "../db";
import { requireAuth, type AuthRequest } from "../auth";

export const pagesRouter = Router();

function toDto(p: PageRow) {
  return {
    slug: p.slug,
    title: p.title,
    body: p.body_html,
    updatedAt: p.updated_at,
    updatedBy: p.updated_by,
  };
}

pagesRouter.get("/:slug", (req, res) => {
  const page = db
    .prepare(`SELECT * FROM pages WHERE slug = ?`)
    .get(req.params.slug) as PageRow | undefined;
  if (!page) {
    res.status(404).json({ error: "Page not found." });
    return;
  }
  res.json(toDto(page));
});

// Any verified user may edit page content.
pagesRouter.put("/:slug", requireAuth, (req: AuthRequest, res) => {
  const page = db
    .prepare(`SELECT slug FROM pages WHERE slug = ?`)
    .get(req.params.slug);
  if (!page) {
    res.status(404).json({ error: "Page not found." });
    return;
  }
  const title = String(req.body?.title ?? "").trim();
  const body = String(req.body?.body ?? "");
  if (!title) {
    res.status(400).json({ error: "Title is required." });
    return;
  }
  db.prepare(
    `UPDATE pages SET title = ?, body_html = ?, updated_at = datetime('now'), updated_by = ?
     WHERE slug = ?`,
  ).run(title, body, req.user!.email, req.params.slug);
  const updated = db
    .prepare(`SELECT * FROM pages WHERE slug = ?`)
    .get(req.params.slug) as PageRow;
  res.json(toDto(updated));
});
