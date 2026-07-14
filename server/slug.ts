import { one } from "./db";

/** Turn a human title into a URL-safe slug (e.g. "Daily Script!" -> "daily-script"). */
export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base || "item";
}

/**
 * A slug derived from `title` that isn't already used in `table`, appending
 * -2, -3, … on collision. `table` is a fixed literal, never user input.
 */
export async function uniqueSlug(
  table: "scripts" | "decks",
  title: string,
): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (await one(`SELECT slug FROM ${table} WHERE slug = $1`, [slug])) {
    slug = `${base}-${n++}`;
  }
  return slug;
}
