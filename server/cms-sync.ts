import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import crypto from "node:crypto";
import { config } from "./config";
import { all, one, run } from "./db";
import { storeFile, deleteFile, contentHash } from "./files";
import { PAGES, SETTINGS, PAGE_SLUGS } from "./seed";
import {
  loadManifest,
  saveManifest,
  assetAbsPath,
  type CmsManifest,
  type ManifestDeck,
  type ManifestScript,
  type ManifestSlide,
} from "./cms-manifest";

// Pull CMS content (pages, settings, scripts, slide decks) from the deployed
// site and apply it locally: upsert into Postgres AND rewrite seed.ts / the
// seed-assets manifest so a reseed carries the same content. Everything is
// fetched before anything is written, so a failed fetch changes nothing.

const seedPath = path.join(config.root, "server", "seed.ts");
const cachePath = path.join(config.root, "server", ".cms-sync-cache.json");

// Text settings that mirror the server's editable set.
const SETTINGS_KEYS = [
  "site_title",
  "zoom_url",
  "meeting_start",
  "meeting_end",
  "meeting_tz",
  "calendar_embed_src",
] as const;

export type SyncTarget = "pages" | "settings" | "scripts" | "decks";

export type SyncOptions = {
  dryRun?: boolean;
  targets?: SyncTarget[];
};

export type SyncReport = {
  ok: boolean;
  remote: string;
  dryRun: boolean;
  pages: { checked: number; changed: string[] };
  settings: { changed: boolean; keys: string[] };
  scripts: { checked: number; changed: string[]; removed: string[] };
  decks: {
    checked: number;
    changed: string[];
    removed: string[];
    imagesDownloaded: number;
  };
  errors: string[];
};

type SyncCache = {
  pages: Record<string, string>;
  settings: string;
  scripts: Record<string, string>;
  decks: Record<string, string>;
};

// ---- low-level fetch --------------------------------------------------------

function httpGet(
  url: string,
  redirects = 3,
): Promise<{ status: number; contentType: string; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https:") ? https : http;
    const req = mod.get(url, (res) => {
      const status = res.statusCode ?? 0;
      const location = res.headers.location;
      if (status >= 300 && status < 400 && location && redirects > 0) {
        res.resume();
        const next = new URL(location, url).toString();
        httpGet(next, redirects - 1).then(resolve, reject);
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () =>
        resolve({
          status,
          contentType: String(res.headers["content-type"] || ""),
          body: Buffer.concat(chunks),
        }),
      );
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("request timed out")));
  });
}

async function getJson<T>(pathname: string): Promise<T> {
  const { status, body } = await httpGet(config.remoteUrl + pathname);
  if (status !== 200) throw new Error(`GET ${pathname} -> ${status}`);
  return JSON.parse(body.toString("utf8")) as T;
}

// Returns null on 404 so a missing page/material is skipped, not fatal.
async function getJsonOrNull<T>(pathname: string): Promise<T | null> {
  const { status, body } = await httpGet(config.remoteUrl + pathname);
  if (status === 404) return null;
  if (status !== 200) throw new Error(`GET ${pathname} -> ${status}`);
  return JSON.parse(body.toString("utf8")) as T;
}

async function getBinary(
  pathname: string,
): Promise<{ buffer: Buffer; mime: string }> {
  const { status, body, contentType } = await httpGet(config.remoteUrl + pathname);
  if (status !== 200) throw new Error(`GET ${pathname} -> ${status}`);
  return { buffer: body, mime: contentType.split(";")[0].trim() };
}

// ---- helpers ----------------------------------------------------------------

function sha(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function settingsHash(values: Record<string, string>): string {
  return sha(JSON.stringify(SETTINGS_KEYS.map((k) => values[k] ?? "")));
}

function deckFingerprint(slides: RemoteSlide[]): string {
  return sha(
    JSON.stringify(
      [...slides]
        .sort((a, b) => a.position - b.position)
        .map((s) => [s.kind, s.alt, s.hash ?? ""]),
    ),
  );
}

function extFor(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (mime === "application/pdf") return ".pdf";
  return "";
}

function loadCache(): SyncCache {
  try {
    const c = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    return {
      pages: c.pages ?? {},
      settings: c.settings ?? "",
      scripts: c.scripts ?? {},
      decks: c.decks ?? {},
    };
  } catch {
    return { pages: {}, settings: "", scripts: {}, decks: {} };
  }
}

function saveCache(c: SyncCache): void {
  fs.writeFileSync(cachePath, JSON.stringify(c, null, 2) + "\n");
}

// Replace the body between `// <cms-sync:name> …` and `// </cms-sync:name>`.
function spliceRegion(src: string, name: string, generated: string): string {
  const start = `// <cms-sync:${name}>`;
  const end = `// </cms-sync:${name}>`;
  const si = src.indexOf(start);
  const ei = src.indexOf(end);
  if (si === -1 || ei === -1) {
    throw new Error(`seed.ts is missing the cms-sync:${name} markers`);
  }
  const afterStartLine = src.indexOf("\n", si) + 1;
  return src.slice(0, afterStartLine) + generated + "\n" + src.slice(ei);
}

function genPages(pages: Array<{ slug: string; title: string; body: string }>): string {
  const items = pages
    .map(
      (p) =>
        `  {\n    slug: ${JSON.stringify(p.slug)},\n    title: ${JSON.stringify(
          p.title,
        )},\n    body: ${JSON.stringify(p.body)},\n  },`,
    )
    .join("\n");
  return `export const PAGES: Array<{ slug: string; title: string; body: string }> = [\n${items}\n];`;
}

function genSettings(values: Record<string, string>): string {
  const items = SETTINGS_KEYS.map(
    (k) => `  ${JSON.stringify(k)}: ${JSON.stringify(values[k] ?? "")},`,
  ).join("\n");
  return `export const SETTINGS: Record<string, string> = {\n${items}\n};`;
}

// ---- remote shapes ----------------------------------------------------------

type RemotePage = { slug: string; title: string; body: string; updatedAt: string };
type RemoteScript = {
  slug: string;
  title: string;
  hasFile: boolean;
  updatedAt: string | null;
};
type RemoteSlide = {
  kind: "image" | "jft";
  alt: string;
  position: number;
  src: string | null;
  hash: string | null;
};
type RemoteDeck = { slug: string; title: string; slides: RemoteSlide[] };

function emptyReport(dryRun: boolean): SyncReport {
  return {
    ok: true,
    remote: config.remoteUrl,
    dryRun,
    pages: { checked: 0, changed: [] },
    settings: { changed: false, keys: [] },
    scripts: { checked: 0, changed: [], removed: [] },
    decks: { checked: 0, changed: [], removed: [], imagesDownloaded: 0 },
    errors: [],
  };
}

// ---- main -------------------------------------------------------------------

export async function syncCms(opts: SyncOptions = {}): Promise<SyncReport> {
  const dryRun = !!opts.dryRun;
  const targets = new Set<SyncTarget>(
    opts.targets ?? ["pages", "settings", "scripts", "decks"],
  );
  const report = emptyReport(dryRun);
  const cache = loadCache();
  const prevManifest = loadManifest() ?? { syncedAt: "", decks: [], scripts: [] };
  const prevDecks = new Map(prevManifest.decks.map((d) => [d.slug, d]));
  const prevScripts = new Map(prevManifest.scripts.map((s) => [s.slug, s]));

  // Downloaded bytes are staged here and only written once ALL fetches succeed.
  const scriptBlobs = new Map<string, { buffer: Buffer; mime: string }>();
  const deckBlobs = new Map<string, { buffer: Buffer; mime: string }>(); // key `${slug}#${pos}`

  let remotePages: RemotePage[] = [];
  let remoteSettings: Record<string, string> = {};
  let settingsChanged = false;
  let remoteScripts: RemoteScript[] = [];
  const changedScripts: string[] = [];
  let remoteDecks: RemoteDeck[] = [];
  const changedDecks: string[] = [];

  try {
    // -- fetch phase (no writes) --
    if (targets.has("pages")) {
      for (const slug of PAGE_SLUGS) {
        const p = await getJsonOrNull<RemotePage>(`/api/pages/${slug}`);
        report.pages.checked++;
        if (!p) continue;
        remotePages.push(p);
        if (cache.pages[slug] !== p.updatedAt) report.pages.changed.push(slug);
      }
    }

    if (targets.has("settings")) {
      const s = await getJson<Record<string, string>>(`/api/settings`);
      remoteSettings = s;
      const h = settingsHash(s);
      settingsChanged = cache.settings !== h;
      report.settings.changed = settingsChanged;
      if (settingsChanged) {
        report.settings.keys = SETTINGS_KEYS.filter(
          (k) => (s[k] ?? "") !== (SETTINGS[k] ?? ""),
        );
      }
    }

    if (targets.has("scripts")) {
      remoteScripts = await getJson<RemoteScript[]>(`/api/scripts`);
      report.scripts.checked = remoteScripts.length;
      for (const sc of remoteScripts) {
        const priorFile = prevScripts.get(sc.slug)?.file ?? null;
        const changed =
          cache.scripts[sc.slug] !== (sc.updatedAt ?? "") ||
          (sc.hasFile && !priorFile);
        if (!changed) continue;
        changedScripts.push(sc.slug);
        report.scripts.changed.push(sc.slug);
        if (sc.hasFile && !dryRun) {
          scriptBlobs.set(sc.slug, await getBinary(`/api/scripts/${sc.slug}/file`));
        }
      }
      const remoteSlugs = new Set(remoteScripts.map((s) => s.slug));
      report.scripts.removed = Object.keys(cache.scripts).filter(
        (slug) => !remoteSlugs.has(slug),
      );
    }

    if (targets.has("decks")) {
      remoteDecks = await getJson<RemoteDeck[]>(`/api/decks`);
      report.decks.checked = remoteDecks.length;
      for (const d of remoteDecks) {
        const fp = deckFingerprint(d.slides);
        const rebuild = cache.decks[d.slug] !== fp || !prevDecks.has(d.slug);
        if (!rebuild) continue;
        changedDecks.push(d.slug);
        report.decks.changed.push(d.slug);
        if (!dryRun) {
          for (const sl of d.slides) {
            if (sl.kind === "jft" || !sl.src) continue;
            const blob = await getBinary(sl.src);
            deckBlobs.set(`${d.slug}#${sl.position}`, blob);
            report.decks.imagesDownloaded++;
          }
        }
      }
      const remoteSlugs = new Set(remoteDecks.map((d) => d.slug));
      report.decks.removed = Object.keys(cache.decks).filter(
        (slug) => !remoteSlugs.has(slug),
      );
    }
  } catch (err) {
    // Any fetch/download failure => abort with zero writes.
    report.ok = false;
    report.errors.push(err instanceof Error ? err.message : String(err));
    return report;
  }

  if (dryRun) return report;

  // -- apply phase (writes) -- reached only when every fetch succeeded --
  try {
    // Pages: upsert changed into DB; rewrite seed.ts from full remote content
    // (merged over the current baseline for any slug the remote didn't return).
    if (targets.has("pages") && remotePages.length) {
      const merged = new Map(PAGES.map((p) => [p.slug, { ...p }]));
      for (const p of remotePages) {
        merged.set(p.slug, { slug: p.slug, title: p.title, body: p.body });
      }
      for (const slug of report.pages.changed) {
        const p = remotePages.find((x) => x.slug === slug)!;
        await run(
          `INSERT INTO pages (slug, title, body_html, updated_by, updated_at)
           VALUES ($1, $2, $3, 'cms-sync', now())
           ON CONFLICT (slug) DO UPDATE
             SET title = excluded.title, body_html = excluded.body_html,
                 updated_by = 'cms-sync', updated_at = now()`,
          [p.slug, p.title, p.body],
        );
        cache.pages[slug] = p.updatedAt;
      }
      const orderedPages = PAGE_SLUGS.map((s) => merged.get(s)!).filter(Boolean);
      let src = fs.readFileSync(seedPath, "utf8");
      src = spliceRegion(src, "pages", genPages(orderedPages));
      fs.writeFileSync(seedPath, src);
    }

    // Settings: upsert changed keys; rewrite seed.ts SETTINGS block.
    if (targets.has("settings") && settingsChanged) {
      for (const k of SETTINGS_KEYS) {
        await run(
          `INSERT INTO settings (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
          [k, remoteSettings[k] ?? ""],
        );
      }
      cache.settings = settingsHash(remoteSettings);
      let src = fs.readFileSync(seedPath, "utf8");
      src = spliceRegion(src, "settings", genSettings(remoteSettings));
      fs.writeFileSync(seedPath, src);
    }

    // Scripts: rebuild the manifest from the full remote list; upsert/download
    // only changed ones; delete removed ones.
    let manifestScripts = prevManifest.scripts;
    if (targets.has("scripts")) {
      const bySlug = new Map(prevScripts);
      for (const sc of remoteScripts) {
        if (changedScripts.includes(sc.slug)) {
          let file: string | null = null;
          let hash: string | null = null;
          const prior = await one<{ file_id: string | null }>(
            `SELECT file_id FROM scripts WHERE slug = $1`,
            [sc.slug],
          );
          if (sc.hasFile) {
            const blob = scriptBlobs.get(sc.slug)!;
            const rel = `scripts/${sc.slug}.pdf`;
            writeAsset(rel, blob.buffer);
            file = rel;
            hash = contentHash(blob.buffer);
            const fileId = await storeFile(blob.mime || "application/pdf", blob.buffer);
            await run(
              `INSERT INTO scripts (slug, title, file_id, updated_at, updated_by)
               VALUES ($1, $2, $3, now(), 'cms-sync')
               ON CONFLICT (slug) DO UPDATE
                 SET title = excluded.title, file_id = excluded.file_id,
                     updated_at = now(), updated_by = 'cms-sync'`,
              [sc.slug, sc.title, fileId],
            );
            if (prior?.file_id && prior.file_id !== fileId) await deleteFile(prior.file_id);
          } else {
            await run(
              `INSERT INTO scripts (slug, title, file_id, updated_at, updated_by)
               VALUES ($1, $2, NULL, now(), 'cms-sync')
               ON CONFLICT (slug) DO UPDATE
                 SET title = excluded.title, file_id = NULL,
                     updated_at = now(), updated_by = 'cms-sync'`,
              [sc.slug, sc.title],
            );
            if (prior?.file_id) await deleteFile(prior.file_id);
          }
          bySlug.set(sc.slug, { slug: sc.slug, title: sc.title, file, hash });
        } else {
          // Unchanged: keep title fresh, keep prior asset reference.
          const prior = bySlug.get(sc.slug);
          bySlug.set(sc.slug, {
            slug: sc.slug,
            title: sc.title,
            file: prior?.file ?? null,
            hash: prior?.hash ?? null,
          });
        }
        cache.scripts[sc.slug] = sc.updatedAt ?? "";
      }
      for (const slug of report.scripts.removed) {
        const prior = await one<{ file_id: string | null }>(
          `SELECT file_id FROM scripts WHERE slug = $1`,
          [slug],
        );
        await run(`DELETE FROM scripts WHERE slug = $1`, [slug]);
        if (prior?.file_id) await deleteFile(prior.file_id);
        const priorRel = bySlug.get(slug)?.file;
        if (priorRel) removeAsset(priorRel);
        bySlug.delete(slug);
        delete cache.scripts[slug];
      }
      manifestScripts = remoteScripts
        .map((s) => bySlug.get(s.slug))
        .filter((x): x is ManifestScript => !!x);
    }

    // Decks: rebuild changed decks fully (download images); reuse prior manifest
    // entries for unchanged decks; delete removed decks.
    let manifestDecks = prevManifest.decks;
    if (targets.has("decks")) {
      const bySlug = new Map(prevDecks);
      for (const d of remoteDecks) {
        if (changedDecks.includes(d.slug)) {
          await run(
            `INSERT INTO decks (slug, title) VALUES ($1, $2)
             ON CONFLICT (slug) DO UPDATE SET title = excluded.title`,
            [d.slug, d.title],
          );
          const oldFiles = await all<{ file_id: string | null }>(
            `SELECT file_id FROM slides WHERE deck_slug = $1`,
            [d.slug],
          );
          await run(`DELETE FROM slides WHERE deck_slug = $1`, [d.slug]);
          for (const f of oldFiles) if (f.file_id) await deleteFile(f.file_id);
          clearAssetDir(`slides/${d.slug}`);

          const slides = [...d.slides].sort((a, b) => a.position - b.position);
          const manifestSlides: ManifestSlide[] = [];
          for (let i = 0; i < slides.length; i++) {
            const sl = slides[i];
            if (sl.kind === "jft" || !sl.src) {
              await run(
                `INSERT INTO slides (deck_slug, file_id, alt, position, kind)
                 VALUES ($1, NULL, $2, $3, 'jft')`,
                [d.slug, sl.alt || "Just for Today", i],
              );
              manifestSlides.push({ kind: "jft", file: null, alt: sl.alt, hash: null });
              continue;
            }
            const blob = deckBlobs.get(`${d.slug}#${sl.position}`)!;
            const rel = `slides/${d.slug}/${String(i).padStart(2, "0")}${extFor(blob.mime)}`;
            writeAsset(rel, blob.buffer);
            const fileId = await storeFile(blob.mime || "image/png", blob.buffer);
            const hash = contentHash(blob.buffer);
            await run(
              `INSERT INTO slides (deck_slug, file_id, alt, position, kind, hash)
               VALUES ($1, $2, $3, $4, 'image', $5)`,
              [d.slug, fileId, sl.alt, i, hash],
            );
            manifestSlides.push({ kind: "image", file: rel, alt: sl.alt, hash });
          }
          bySlug.set(d.slug, { slug: d.slug, title: d.title, slides: manifestSlides });
          cache.decks[d.slug] = deckFingerprint(d.slides);
        } else {
          const prior = bySlug.get(d.slug);
          if (prior) bySlug.set(d.slug, { ...prior, title: d.title });
        }
      }
      for (const slug of report.decks.removed) {
        const oldFiles = await all<{ file_id: string | null }>(
          `SELECT file_id FROM slides WHERE deck_slug = $1`,
          [slug],
        );
        await run(`DELETE FROM decks WHERE slug = $1`, [slug]);
        for (const f of oldFiles) if (f.file_id) await deleteFile(f.file_id);
        clearAssetDir(`slides/${slug}`);
        bySlug.delete(slug);
        delete cache.decks[slug];
      }
      manifestDecks = remoteDecks
        .map((d) => bySlug.get(d.slug))
        .filter((x): x is ManifestDeck => !!x);
    }

    // Persist the manifest (binary content) and the cache (change markers).
    const manifest: CmsManifest = {
      syncedAt: new Date().toISOString(),
      decks: manifestDecks,
      scripts: manifestScripts,
    };
    saveManifest(manifest);
    saveCache(cache);
  } catch (err) {
    report.ok = false;
    report.errors.push(
      `apply failed after fetch: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return report;
}

export function cmsDrift(): Promise<SyncReport> {
  return syncCms({ dryRun: true });
}

// ---- asset file helpers -----------------------------------------------------

function writeAsset(rel: string, data: Buffer): void {
  const abs = assetAbsPath(rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, data);
}

function removeAsset(rel: string): void {
  try {
    fs.rmSync(assetAbsPath(rel), { force: true });
  } catch {
    /* ignore */
  }
}

function clearAssetDir(rel: string): void {
  try {
    fs.rmSync(assetAbsPath(rel), { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}
