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
    body: "<p>When the country went into lockdown on Friday, March 13, 2020, to prevent the spread of COVID 19, a group of concerned recovering addicts fearing that LGBTQIA+ folk would not have a safe space to continue their recovery created *<strong>Zoom in on Recovery.</strong></p><p>Members from SOS group and Serenity Sunday met to create this new group. Both groups still meet at the Lesbian, Gay, Bisexual and Transgender Community Center in New York City.&nbsp;We named the group, ZIOR because we were acutely aware that we needed to concentrate or drill down on bringing the spiritual principle into this new environment. While we are a special interest group, our meetings are open to everyone! Newcomers are especially welcome and wanted, because we can only keep what we have by giving it away.  </p><p>To that end, Zoom in on Recovery has established a group policy, joined and contributed to the Manhattan Area Service Committee. We also contribute to the Greater New York Regional Service Committee and the World Service Committee. We are proud to have a Basic Text Gift Program, which provides a physical book to members needing this most essential tool. We have created new service positions: trainer; Group Service Representative (GSR) and Alternate GSR. For six years, we have welcomed NA Members from every region of the United States, Canada, and abroad, who are committed to getting and staying clean on the screen...roughly 40 members nightly.</p><p>Ever evolving, we now celebrate one year or more anniversaries with an Anniversary Panel on the last day of each month, the first of the month we have a Newcomers Panel, and tradition-of-the-month meeting on the first Friday of each month. There is also a Step working Study Hall on Saturdays!</p><p> </p><p></p><p><em>*It is important to note that this group is not affiliated with Zoom in any way aside from hosting our meetings on the Zoom platform. Our relationship is the same as an in-person meeting paying rent to a facility for the use of a meeting space.</em></p>",
  },
  {
    slug: "for-the-newcomer",
    title: "For The Newcomer",
    body: "<p>Welcome to Narcotics Anonymous! We’re so glad you found us! We are the <strong>Z</strong>oom <strong>I</strong>n <strong>O</strong>n <strong>R</strong>ecovery&nbsp;group, fondly known as <strong>ZIOR</strong>! </p><p></p><p>In NA we say that “the newcomer is the most important person at any meeting because we can only keep what we have by giving it away!”&nbsp;</p><p>It took me a little time to truly understand this message, to understand that one addict helping another is the most incredible spiritual reward!</p><p></p><p>Not to worry, I too was unsure of the concept of “god” and “spirituality” for some time.</p><p></p><p>Turns out that, for me, it simply means honoring the good that is you, to honor that good that is me. It really is a simple program.</p><p></p><p>Narcotics Anonymous saved my life. We can’t wait to show you how it works!</p><p></p><p>Please, stick around, have a seat, and be amazed at what you’ll receive that you never dreamed possible!</p><p></p><p>This is&nbsp;a “WE” program. WE can’t do this alone!&nbsp; WE need you!&nbsp;</p><p></p><p>Welcome home!</p>",
  },
  {
    slug: "helpful-links",
    title: "Helpful Links",
    body: "<ul><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"http://NA.org\">NA.org</a> - The official site of Narcotics Anonymous.</p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://na.org/meetingsearch/\">NA Meeting Search</a> - Find in-person and virtual NA meetings anywhere in the world, plus regional helplines if you need to talk to someone now.</p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://na.org/literature/recovery-literature-in-english-usa/\">Recovery Literature</a> - Free NA booklets, Informational Pamphlets, and Group Readings.</p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://na.org/literature/basic-text-audio/\">Basic Text Audio</a> - Free streaming/downloadable audio of the Basic Text and the Introductory Guide.</p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://virtual-na.org/\">Virtual NA</a> - A hub for online and phone NA meetings.</p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://nadailyinventory.com/\">Daily 10th Step Inventory</a> - A simple daily tool for working the 10th Step and checking in with yourself.</p></li><li><p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://na.org/purchase-na-literature/\">NA Online Store</a> - Where to purchase the Basic Text and other approved NA literature.</p></li></ul>",
  },
  {
    slug: "service-at-zior",
    title: "Service at ZIOR",
    body: "<p>It is often said that service keeps us clean because we can only keep what we have by giving it away. Lots of work goes into making sure that ZIOR meetings run every single night of the week, as they have since March 2020. We call this work \"service\", and the people who do it are called \"trusted servants\". Service keeps us connected to our recovery, our community and our spiritual principles. It can give us a sense of belonging and purpose at our meetings, especially at our home group.</p><p>The best place to learn more about service at ZIOR is at our business meetings, held on the first and third Monday of the month one hour before the regular meeting. For those who are curious, a quick preview of our service positions is below:</p><p><strong>Asterisk co-hosts</strong> are chosen at the beginning of each meeting. They are responsible for supporting our hosts and cohosts to maintain an atmosphere of recovery, managing the Zoom chat and participants list. An addict who has achieved 90 days of consecutive clean time and who has gone through our service training is eligible to serve as asterisk.</p><p>Every three months, seven addicts step up to serve as <strong>hosts </strong>and <strong>co-hosts</strong> for the meeting. Each of these addicts chooses one night a week on which they will <strong>host </strong>(invite speakers, read the script and manage the timer) and one night on which they will <strong>co-host </strong>(share the daily slides, manage the chat and waiting room). Without these trusted servants, our meeting would not be able to run smoothly, or at all. An addict who has gone through service training and has achieved 6 months of consecutive clean time is eligible to serve as host and co-host.</p><p>There are opportunities to serve at the business meeting, too. Our group <strong>secretary </strong>(90 days clean time)<strong> </strong>takes the notes for every business meeting. The <strong>group chair</strong> (1 year clean time and 1 year NA service) runs the business meeting, just as the host runs the regular meeting. The <strong>treasurer </strong>(1 year clean time) is responsible for safeguarding our seventh tradition funds and distributing them to the rest of NA. The <strong>group service representative </strong>or GSR (1 year clean time) attends area business meetings and brings our group's opinion on important matters back to the larger NA community. And, our <strong>trainers </strong>(6 months clean time) are responsible for making sure hosts, co-hosts and asterisk co-hosts are comfortable with Zoom and PowerPoint and able to facilitate the meeting.</p><p>Having read all this, if you're excited about service but don't yet meet the clean time requirements, that's okay! You can go through service training at any time. That way, you'll be ready to take on a trusted servant position as soon as you're ready. Come to our business meeting to find out more.</p><p>If on the other hand, you find yourself shaking your head and thinking \"there's no way I can do that!\", you should know that many of us felt the same way. When we admitted our anxieties and jumped in with both feet anyway, the group was there to support us, and we got to experience all the benefits that service has to offer. And in the meantime, remember that there are lots of ways to do service. Showing up at meetings, listening attentively to other addicts, sharing our experience strength and hope, and serving as a speaker when invited to do so are all ways we can be useful to ourselves and others. The most important service of all is to keep coming back!</p>",
  },
  {
    slug: "service-at-zior-more",
    title: "More about service",
    body: "<p>The content of this website is editable only by the Group Chair or a delegated trusted servant, so they are the only users who are able to sign in. If you would like to suggest changes or corrections to this website, come to our business meeting! It is held the 1st and 3rd Monday of every month at 6pm EST, one hour before the regular meeting.</p>",
  },
  {
    slug: "seventh-tradition",
    title: "7th Tradition",
    body: "<hr><blockquote><p>\"Every NA group ought to be fully self-supporting, declining outside contributions.\"<br>— The 7th Tradition of Narcotics Anonymous</p></blockquote><p>Freedom is one of the most important spiritual principles in Narcotics Anonymous. First and foremost is freedom from active addiction, but we find freedom in many other areas of our lives, including the freedom to make our own decisions. In active addiction, most of our decisions were made for us by our disease, by the courts or by institutions that were trying to take care of us. Today, the freedom to make our own decisions is sacred to us, because we know how easy it is to lose that freedom.</p><p>We have found that whenever we accept external contributions, be it in the form of money, labor, usage of a facility, or anything coming from outside the fellowship, the freedom to make our own decisions is threatened. Any time someone outside of NA wants to help NA, no matter how good their intentions are, there is always the possibility that they will feel that NA \"owes\" them, or that NA endorses their facility/charity/religious organization etc. by accepting that help. We cannot allow this to happen if we want to retain our freedom.</p><p>To that end, we ask that only NA members, or those who think they have a problem with drugs, contribute to our 7th Tradition. If you are a member and you cannot donate money, that is fine; We need you more than we need your money. Keep coming to our meetings, share your experience with us, and when you can, volunteer to do service. Above all, KEEP COMING BACK!</p>",
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

function toDeckSpec(
  slug: string,
  title: string,
  list: string[][],
): ManifestDeck {
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

// Written to `settings` once the defaults have been laid down (or once an
// existing database has been adopted as the source of truth). Its presence is
// what stops a dyno restart from re-seeding — and thereby resurrecting rows a
// trusted servant has deliberately deleted.
const SEED_MARKER_KEY = "seed_completed_at";

async function isSeeded(): Promise<boolean> {
  const row = await one(`SELECT value FROM settings WHERE key = $1`, [
    SEED_MARKER_KEY,
  ]);
  return Boolean(row);
}

/** True if the database already holds seedable content (an established site). */
async function hasExistingContent(): Promise<boolean> {
  const row = await one<{ n: string }>(
    `SELECT (SELECT COUNT(*) FROM pages)
          + (SELECT COUNT(*) FROM scripts)
          + (SELECT COUNT(*) FROM decks) AS n`,
  );
  return Number(row?.n ?? 0) > 0;
}

async function markSeeded(): Promise<void> {
  await run(
    `INSERT INTO settings (key, value) VALUES ($1, now()::text)
     ON CONFLICT (key) DO NOTHING`,
    [SEED_MARKER_KEY],
  );
}

/** Ensure the configured admin can always sign in. Access recovery, not content. */
async function ensureAdmin(): Promise<void> {
  if (!config.adminEmail) return;
  await run(
    `INSERT INTO users (email, is_admin) VALUES ($1, TRUE)
     ON CONFLICT (email) DO UPDATE SET is_admin = TRUE`,
    [config.adminEmail],
  );
}

export async function seed() {
  // Always keep admin access working, regardless of seed state.
  await ensureAdmin();

  // Seed exactly once in a database's lifetime. After that the database — most
  // importantly production — is the sole source of truth, so a restart never
  // re-adds content that was deleted through the app.
  if (await isSeeded()) return;

  // A database that predates this marker but already has content (i.e. the
  // live production site) is adopted as-is: record the marker and seed nothing.
  if (await hasExistingContent()) {
    await markSeeded();
    return;
  }

  // From here down we know the database is empty — lay down bundled defaults.
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

  // Reached only on a fresh database (see the guards at the top of seed), so
  // this extra check is belt-and-suspenders against a partially-populated DB.
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

  // Ensure each freshly-seeded meeting deck has the live "Just for Today" slide,
  // placed right after the intro (skipped when a manifest deck already includes
  // its own jft slide).
  for (const deckSlug of ["daily", "anniversary"]) {
    const deck = await one(`SELECT slug FROM decks WHERE slug = $1`, [
      deckSlug,
    ]);
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

  await markSeeded();
}
