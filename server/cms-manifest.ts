import fs from "node:fs";
import path from "node:path";
import { config } from "./config";

// The manifest describes the binary CMS materials (scripts + slide decks) that a
// remote sync has pulled into seed-assets/. When present it overrides the
// hardcoded defaults in seed.ts, so a fresh `dev:reset` reseeds current content.
// It is written only by cms-sync; absent on a fresh checkout (defaults are used).

export type ManifestSlide = {
  kind: "image" | "jft";
  // Path relative to seed-assets/ (null for a "jft" slide, which has no image).
  file: string | null;
  alt: string;
  hash: string | null;
};

export type ManifestDeck = {
  slug: string;
  title: string;
  slides: ManifestSlide[];
};

export type ManifestScript = {
  slug: string;
  title: string;
  file: string | null; // path relative to seed-assets/, null if no PDF yet
  hash: string | null;
};

export type CmsManifest = {
  syncedAt: string;
  decks: ManifestDeck[];
  scripts: ManifestScript[];
};

export const manifestPath = path.join(config.seedAssetsDir, "cms-manifest.json");

/** Resolve a manifest-relative asset path to an absolute one under seed-assets/. */
export function assetAbsPath(rel: string): string {
  return path.join(config.seedAssetsDir, rel);
}

/** Load the manifest, or null if it's absent or unreadable/corrupt (stay safe). */
export function loadManifest(): CmsManifest | null {
  try {
    if (!fs.existsSync(manifestPath)) return null;
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (!parsed || !Array.isArray(parsed.decks) || !Array.isArray(parsed.scripts)) {
      return null;
    }
    return parsed as CmsManifest;
  } catch {
    return null;
  }
}

export function saveManifest(m: CmsManifest): void {
  fs.mkdirSync(config.seedAssetsDir, { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2) + "\n");
}
