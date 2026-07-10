import { Router } from "express";
import { one, run, type PageRow } from "../db";
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

pagesRouter.get("/:slug", async (req, res) => {
  const page = await one<PageRow>(`SELECT * FROM pages WHERE slug = $1`, [
    req.params.slug,
  ]);
  if (!page) {
    res.status(404).json({ error: "Page not found." });
    return;
  }
  res.json(toDto(page));
});

// Any verified user may edit page content.
pagesRouter.put("/:slug", requireAuth, async (req: AuthRequest, res) => {
  const page = await one(`SELECT slug FROM pages WHERE slug = $1`, [
    req.params.slug,
  ]);
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
  await run(
    `UPDATE pages SET title = $1, body_html = $2, updated_at = now(), updated_by = $3
     WHERE slug = $4`,
    [title, body, req.user!.email, req.params.slug],
  );
  const updated = await one<PageRow>(`SELECT * FROM pages WHERE slug = $1`, [
    req.params.slug,
  ]);
  res.json(toDto(updated!));
});
