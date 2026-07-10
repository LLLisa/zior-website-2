import crypto from "node:crypto";
import { one, run } from "./db";

export async function storeFile(mime: string, data: Buffer): Promise<string> {
  const id = crypto.randomBytes(16).toString("hex");
  await run(`INSERT INTO files (id, mime, data) VALUES ($1, $2, $3)`, [
    id,
    mime,
    data,
  ]);
  return id;
}

export async function getFile(
  id: string,
): Promise<{ mime: string; data: Buffer } | undefined> {
  return one<{ mime: string; data: Buffer }>(
    `SELECT mime, data FROM files WHERE id = $1`,
    [id],
  );
}

export async function deleteFile(id: string | null | undefined) {
  if (id) await run(`DELETE FROM files WHERE id = $1`, [id]);
}
