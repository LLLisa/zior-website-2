import { Router } from "express";
import { getFile } from "../files";

export const filesRouter = Router();

// Serve an uploaded binary (slide image / QR code) straight from Postgres.
filesRouter.get("/:id", async (req, res) => {
  const file = await getFile(req.params.id);
  if (!file) {
    res.status(404).end();
    return;
  }
  res.setHeader("Content-Type", file.mime);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.end(file.data);
});
