import fs from "node:fs";
import path from "node:path";
import { one, run } from "./db";
import { storeFile } from "./files";
import { config } from "./config";
import {
  loadManifest,
  type ManifestDeck,
  type ManifestScript,
} from "./cms-manifest";

function mimeFor(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".pdf") return "application/pdf";
  return "application/octet-stream";
}

/** Store a bundled seed asset into the files table; returns its file id or null. */
async function seedFile(relFromSeed: string): Promise<string | null> {
  const src = path.join(config.seedAssetsDir, relFromSeed);
  if (!fs.existsSync(src)) return null;
  return storeFile(mimeFor(src), fs.readFileSync(src));
}

// <cms-sync:pages> — AUTO-GENERATED; refresh via the cms-sync MCP tool, do not hand-edit.
export const PAGES: Array<{ slug: string; title: string; body: string }> = [
  {
    slug: "home",
    title: "Welcome to Zoom In On Recovery!",
    body: "<p>We are an LGBTQIA+ meeting of Narcotics Anonymous, but as the Third Tradition states, the only requirement for membership is a desire to stop using — so <strong>all are welcome here</strong>. We meet every day from 7:00 PM to 8:00 PM Eastern Time. You may join our meeting by clicking the button above or scanning the QR code on your phone.</p>\n<p>Also, please join us 15 minutes before the meeting for fellowship (we call it the \"parking lot\") and to make sure you can get in. You can stay after the meeting to let us get to know you as well. We look forward to seeing you there!</p>\n<p>The format of the meeting is a book study. We read the Just for Today daily meditation and then our speaker shares for 10–15 minutes on the reading. After that we have open shares until 10 minutes before the end of the meeting, at which time we call for a burning desire. We celebrate anniversaries on the last day of the month, and our business meetings are held every 1st and 3rd Monday an hour before the meeting. Check out <a href=\"/calendar\">our calendar</a> for more information.</p>\n<p>We hope you will join us and find the love and support that we have found in this fellowship. And above all,</p>",
  },
  {
    slug: "about",
    title: "About Us",
    body: "<p>When the country went into lockdown on Friday, March 13, 2020, to prevent the spread of COVID 19, a group of concerned recovering addicts fearing that LGBTQIA+ folk would not have a safe space to continue their recovery created ZIOR.</p><p>Our first official meeting was, March 17, 2020, at 7:00pm EST, and every day since. &nbsp;We named the group, <strong>Zoom in on Recovery</strong> because we were acutely aware that we needed to concentrate or drill down on bringing the spiritual principle into this new environment. It is important to note that <strong>this group is not affiliated with Zoom in any way </strong>aside from hosting our meetings on the Zoom platform. Our relationship is the same as an in-person meeting paying rent to a facility for the use of a meeting space.</p><p>While we are a special interest group, our meetings are open to everyone! Newcomers are especially welcome and wanted, because we can only keep what we have by giving it away.</p>",
  },
  {
    slug: "for-the-newcomer",
    title: "For The Newcomer",
    body: "<p>This is the ForTheNewcomer section. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
  },
  {
    slug: "helpful-links",
    title: "Helpful Links",
    body: "<p>This is the Helpful Links section.</p>\n<ul>\n  <li><a href=\"https://www.na.org/\">Narcotics Anonymous</a></li>\n  <li><a href=\"https://www.na.org/?ID=ips-eng-index\">Informational Pamphlets</a></li>\n  <li><a href=\"https://nadailyinventory.com/\">Daily 10th Step Inventory</a></li>\n</ul>",
  },
  {
    slug: "service-at-zior",
    title: "Service at ZIOR",
    body: "<p>This is the ServiceAtZior section. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
  },
  {
    slug: "service-at-zior-more",
    title: "More about service",
    body: "<p>The content of this website is editable only by the Group Chair or a delegated trusted servant, so they are the only users who are able to sign in. If you would like to suggest changes or corrections to this website, come to our business meeting! It is held the 1st and 3rd Monday of every month at 6pm EST, one hour before the regular meeting.</p>",
  },
  {
    slug: "seventh-tradition",
    title: "7th Tradition",
    body: "<p>This is the SeventhTradition section. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
  },
];
// </cms-sync:pages>

// <cms-sync:settings> — AUTO-GENERATED; refresh via the cms-sync MCP tool, do not hand-edit.
export const SETTINGS: Record<string, string> = {
  "site_title": "Zoom In On Recovery",
  "zoom_url": "https://us02web.zoom.us/j/75907342333?pwd=MFd0OGo5dzBSbHIzY1ZORUw5Y09xZz09",
  "meeting_start": "19:00",
  "meeting_end": "20:00",
  "meeting_tz": "America/New_York",
  "calendar_embed_src": "https://calendar.google.com/calendar/embed?src=0994f22fd2f97cedaa5213db3b2b8ab0f2325b0ec366356ec8aefc4dfd4b8f9f%40group.calendar.google.com&ctz=America%2FNew_York",
};
// </cms-sync:settings>

/** Page slugs the app ships with; the remote sync fetches each of these. */
export const PAGE_SLUGS = PAGES.map((p) => p.slug);

// Default binary materials, used on a fresh database when no cms-sync manifest is
// present. Slide files are relative to seed-assets/. "jft" slides are added by
// the ensure-step below, not listed here.
const DAILY_SLIDES = [
  ["intro.png", "This is the intro screen"],
  ["who.png", "Who is an addict?"],
  ["what.png", "What is the NA program?"],
  ["why.png", "Why are we here?"],
  ["how1.png", "How it works, part 1"],
  ["how2.png", "How it works, part 2"],
  ["7thTradition.png", "7th Tradition"],
];

const ANNIVERSARY_EXTRA = [
  ["countdownStart.png", "Clean time countdown start"],
  ["multipleYears.png", "Multiple years clean"],
  ["18Months.png", "18 months clean"],
  ["1Year.png", "1 year clean"],
  ["9Months.png", "9 months clean"],
  ["6Months.png", "6 months clean"],
  ["90Days.png", "3 months clean"],
  ["60Days.png", "60 days clean"],
  ["30Days.png", "30 days clean"],
  ["1Day.png", "Just for today"],
  ["welcomeHome.png", "Welcome to the family"],
];

function toDeckSpec(slug: string, title: string, list: string[][]): ManifestDeck {
  return {
    slug,
    title,
    slides: list.map(([file, alt]) => ({
      kind: "image" as const,
      file: `slides/${file}`,
      alt,
      hash: null,
    })),
  };
}

const DEFAULT_DECKS: ManifestDeck[] = [
  toDeckSpec("daily", "Daily Meeting Slides", DAILY_SLIDES),
  toDeckSpec("anniversary", "Anniversary Meeting Slides", [
    ...DAILY_SLIDES,
    ...ANNIVERSARY_EXTRA,
  ]),
];

const DEFAULT_SCRIPTS: ManifestScript[] = [
  {
    slug: "daily",
    title: "Daily Meeting Script",
    file: "scripts/currentDailyScript.pdf",
    hash: null,
  },
  {
    slug: "anniversary",
    title: "Anniversary Meeting Script",
    file: "scripts/currentAnniversaryScript.pdf",
    hash: null,
  },
];

export async function seed() {
  for (const p of PAGES) {
    await run(
      `INSERT INTO pages (slug, title, body_html, updated_by)
       VALUES ($1, $2, $3, 'seed') ON CONFLICT (slug) DO NOTHING`,
      [p.slug, p.title, p.body],
    );
  }

  for (const [k, v] of Object.entries(SETTINGS)) {
    await run(
      `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [k, v],
    );
  }

  // QR image — only seed if not already set.
  const qr = await one(`SELECT value FROM settings WHERE key = 'qr_file_id'`);
  if (!qr) {
    const qrId = await seedFile("zoomQrCode.png");
    if (qrId) {
      await run(`INSERT INTO settings (key, value) VALUES ('qr_file_id', $1)`, [
        qrId,
      ]);
    }
  }

  // 7th Tradition slide shown on that page — default to the bundled slide image.
  const st = await one(
    `SELECT value FROM settings WHERE key = 'seventh_tradition_file_id'`,
  );
  if (!st) {
    const stId = await seedFile("slides/7thTradition.png");
    if (stId) {
      await run(
        `INSERT INTO settings (key, value) VALUES ('seventh_tradition_file_id', $1)`,
        [stId],
      );
    }
  }

  // A cms-sync manifest, when present, replaces the hardcoded defaults so a fresh
  // reseed carries the content last pulled from the deployed site.
  const manifest = loadManifest();
  const deckSpecs = manifest?.decks ?? DEFAULT_DECKS;
  const scriptSpecs = manifest?.scripts ?? DEFAULT_SCRIPTS;

  // Decks/slides only on a fresh database so deletions aren't resurrected.
  const deckCount = await one<{ count: string }>(`SELECT COUNT(*) FROM decks`);
  if (Number(deckCount?.count ?? 0) === 0) {
    for (const d of deckSpecs) {
      await run(
        `INSERT INTO decks (slug, title) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
        [d.slug, d.title],
      );
      for (let i = 0; i < d.slides.length; i++) {
        const s = d.slides[i];
        if (s.kind === "jft") {
          await run(
            `INSERT INTO slides (deck_slug, file_id, alt, position, kind)
             VALUES ($1, NULL, $2, $3, 'jft')`,
            [d.slug, s.alt || "Just for Today", i],
          );
          continue;
        }
        const fileId = s.file ? await seedFile(s.file) : null;
        if (!fileId) continue;
        await run(
          `INSERT INTO slides (deck_slug, file_id, alt, position, hash)
           VALUES ($1, $2, $3, $4, $5)`,
          [d.slug, fileId, s.alt, i, s.hash],
        );
      }
    }
  }

  // Ensure each meeting deck has the live "Just for Today" slide, placed right
  // after the intro. Idempotent, so it also lands in an already-seeded database
  // (and is skipped when a manifest deck already includes its own jft slide).
  for (const deckSlug of ["daily", "anniversary"]) {
    const deck = await one(`SELECT slug FROM decks WHERE slug = $1`, [deckSlug]);
    if (!deck) continue;
    const hasJft = await one(
      `SELECT id FROM slides WHERE deck_slug = $1 AND kind = 'jft'`,
      [deckSlug],
    );
    if (hasJft) continue;
    await run(
      `UPDATE slides SET position = position + 1 WHERE deck_slug = $1 AND position >= 1`,
      [deckSlug],
    );
    await run(
      `INSERT INTO slides (deck_slug, file_id, alt, position, kind)
       VALUES ($1, NULL, 'Just for Today', 1, 'jft')`,
      [deckSlug],
    );
  }

  for (const sp of scriptSpecs) {
    const existing = await one(`SELECT slug FROM scripts WHERE slug = $1`, [
      sp.slug,
    ]);
    if (existing) continue;
    const fileId = sp.file ? await seedFile(sp.file) : null;
    await run(
      `INSERT INTO scripts (slug, title, file_id, updated_at, updated_by)
       VALUES ($1, $2, $3, now(), 'seed')`,
      [sp.slug, sp.title, fileId],
    );
  }

  if (config.adminEmail) {
    await run(
      `INSERT INTO users (email, is_admin) VALUES ($1, TRUE)
       ON CONFLICT (email) DO UPDATE SET is_admin = TRUE`,
      [config.adminEmail],
    );
  }
}
