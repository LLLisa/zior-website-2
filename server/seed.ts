import fs from "node:fs";
import path from "node:path";
import { one, run } from "./db";
import { storeFile } from "./files";
import { config } from "./config";

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

const PAGES: Array<{ slug: string; title: string; body: string }> = [
  {
    slug: "home",
    title: "Welcome to Zoom In On Recovery!",
    body: `
<p>We are an LGBTQIA+ meeting of Narcotics Anonymous, but as the Third Tradition states, the only requirement for membership is a desire to stop using — so <strong>all are welcome here</strong>. We meet every day from 7:00 PM to 8:00 PM Eastern Time. You may join our meeting by clicking the button above or scanning the QR code on your phone.</p>
<p>Also, please join us 15 minutes before the meeting for fellowship (we call it the "parking lot") and to make sure you can get in. You can stay after the meeting to let us get to know you as well. We look forward to seeing you there!</p>
<p>The format of the meeting is a book study. We read the Just for Today daily meditation and then our speaker shares for 10–15 minutes on the reading. After that we have open shares until 10 minutes before the end of the meeting, at which time we call for a burning desire. We celebrate anniversaries on the last day of the month, and our business meetings are held every 1st and 3rd Monday an hour before the meeting. Check out <a href="/calendar">our calendar</a> for more information.</p>
<p>We hope you will join us and find the love and support that we have found in this fellowship. And above all,</p>
<p><strong>KEEP COMING BACK!</strong></p>`.trim(),
  },
  {
    slug: "about",
    title: "About Us",
    body: `
<p>When the country went into lockdown on Friday, March 13, 2020, to prevent the spread of COVID 19, a group of concerned recovering addicts fearing that LGBTQIA+ folk would not have a safe space to continue their recovery created ZIOR.</p>
<p>Our first official meeting was, March 17, 2020, at 7:00pm EST, and every day since. The group decided that we should meet nightly to assure that our members had a space to process the pandemic as it was unfolding. We named the group, Zoom in on Recovery, because we were acutely aware that we needed to concentrate on bringing NA's spiritual principles into this new environment. We chose the Just for Today daily meditation to provide structure and consistency for our new group.</p>
<p>We continue meeting and enjoy an attendance of roughly 40 members nightly. Zoom in on Recovery has established a group policy, we contribute quarterly to the Manhattan Area Service Committee, Greater New York Regional Service Committee, and the World Service Committee. We are proud to have started a Basic Text Gift Program, which provides a physical or digital copy to members needing this most essential tool. This program was an extension of and tangible expression of hospitality. We are intentional about welcoming newcomers, maintaining a safe space that is born of our commitment to practicality.</p>
<p>While we are a special interest group, our meetings are open to everyone! Even those who are just contemplating staying clean. The meeting is a one-hour book study, holds space for a burning desire, and touts a robust parking lot before and after the meeting! On occasion, the parking lot is more formal with a group member facilitating the discussion.</p>`.trim(),
  },
  {
    slug: "for-the-newcomer",
    title: "For The Newcomer",
    body: `<p>This is the ForTheNewcomer section. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,
  },
  {
    slug: "helpful-links",
    title: "Helpful Links",
    body: `
<p>This is the Helpful Links section.</p>
<ul>
  <li><a href="https://www.na.org/">Narcotics Anonymous</a></li>
  <li><a href="https://www.na.org/?ID=ips-eng-index">Informational Pamphlets</a></li>
  <li><a href="https://nadailyinventory.com/">Daily 10th Step Inventory</a></li>
</ul>`.trim(),
  },
  {
    slug: "service-at-zior",
    title: "Service at ZIOR",
    body: `<p>This is the ServiceAtZior section. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,
  },
  {
    slug: "service-at-zior-more",
    title: "More about service",
    body: `<p>This is a second editable section for the Service at ZIOR page. Trusted servants can sign in below to edit the site's content.</p>`,
  },
  {
    slug: "seventh-tradition",
    title: "7th Tradition",
    body: `<p>This is the SeventhTradition section. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,
  },
];

const SETTINGS: Record<string, string> = {
  site_title: "Zoom In On Recovery",
  zoom_url:
    "https://us02web.zoom.us/j/75907342333?pwd=MFd0OGo5dzBSbHIzY1ZORUw5Y09xZz09",
  meeting_start: "19:00",
  meeting_end: "20:00",
  meeting_tz: "America/New_York",
  calendar_embed_src:
    "https://calendar.google.com/calendar/embed?src=0994f22fd2f97cedaa5213db3b2b8ab0f2325b0ec366356ec8aefc4dfd4b8f9f%40group.calendar.google.com&ctz=America%2FNew_York",
};

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

  // Decks/slides only on a fresh database so deletions aren't resurrected.
  const deckCount = await one<{ count: string }>(`SELECT COUNT(*) FROM decks`);
  if (Number(deckCount?.count ?? 0) === 0) {
    await run(`INSERT INTO decks (slug, title) VALUES ($1, $2)`, [
      "daily",
      "Daily Meeting Slides",
    ]);
    await run(`INSERT INTO decks (slug, title) VALUES ($1, $2)`, [
      "anniversary",
      "Anniversary Meeting Slides",
    ]);

    const seedDeck = async (deck: string, list: string[][]) => {
      for (let i = 0; i < list.length; i++) {
        const [file, alt] = list[i];
        const fileId = await seedFile(path.join("slides", file));
        if (!fileId) continue;
        await run(
          `INSERT INTO slides (deck_slug, file_id, alt, position)
           VALUES ($1, $2, $3, $4)`,
          [deck, fileId, alt, i],
        );
      }
    };
    await seedDeck("daily", DAILY_SLIDES);
    await seedDeck("anniversary", [...DAILY_SLIDES, ...ANNIVERSARY_EXTRA]);
  }

  const scripts: Array<[string, string, string]> = [
    ["daily", "Daily Meeting Script", "currentDailyScript.pdf"],
    ["anniversary", "Anniversary Meeting Script", "currentAnniversaryScript.pdf"],
  ];
  for (const [slug, title, file] of scripts) {
    const existing = await one(`SELECT slug FROM scripts WHERE slug = $1`, [slug]);
    if (existing) continue;
    const fileId = await seedFile(path.join("scripts", file));
    await run(
      `INSERT INTO scripts (slug, title, file_id, updated_at, updated_by)
       VALUES ($1, $2, $3, now(), 'seed')`,
      [slug, title, fileId],
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
