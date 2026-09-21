// Shared access to the public "Just for Today" daily meditation. Used both by
// the /jftText proxy (for the page and the on-screen slide) and by the deck PDF
// export (which needs plain text to typeset).

// The reading only changes once a day, so cache it for the calendar day and
// reuse it until the date rolls over. Keyed on the US/Eastern date to match the
// meeting's timezone (and roughly when na.org publishes the new reading), so
// the cache invalidates in step with the content rather than at UTC midnight.
let cache: { day: string; html: string } | null = null;
let inflight: Promise<string> | null = null;

function easternDay(): string {
  // "en-CA" yields an ISO-ish YYYY-MM-DD, which is a stable cache key.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// na.org/daily-meditations/ is a full WordPress page with two tabs (Just for
// Today, and A Spiritual Principle a Day) plus all the site's nav/footer/script
// chrome. The JFT reading itself is the <table> immediately following the
// aria-labelledby="jft" tab panel marker — the only reliable, upstream-owned
// anchor for it. Extracting just that table here (rather than caching/proxying
// the whole page) is what keeps the rest of the app's HTML consumers working
// unchanged.
function extractJftFragment(fullHtml: string): string {
  const marker = fullHtml.indexOf('aria-labelledby="jft"');
  if (marker === -1) {
    throw new Error("JFT upstream page shape changed: tab marker not found");
  }
  const tableStart = fullHtml.indexOf("<table", marker);
  if (tableStart === -1) {
    throw new Error("JFT upstream page shape changed: table not found");
  }
  const tableEnd = fullHtml.indexOf("</table>", tableStart);
  if (tableEnd === -1) {
    throw new Error("JFT upstream page shape changed: table not closed");
  }
  return fullHtml.slice(tableStart, tableEnd + "</table>".length);
}

export async function fetchJftHtml(): Promise<string> {
  const day = easternDay();
  if (cache && cache.day === day) return cache.html;

  // Coalesce concurrent misses so a burst only triggers one upstream fetch.
  if (!inflight) {
    inflight = (async () => {
      const upstream = await fetch("https://na.org/daily-meditations/");
      if (!upstream.ok) {
        throw new Error(`JFT upstream returned ${upstream.status}`);
      }
      const fullHtml = await upstream.text();
      const html = extractJftFragment(fullHtml);
      cache = { day, html }; // only cache on success, so errors aren't sticky
      return html;
    })().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

/** Strip the JFT HTML down to newline-separated, PDF-safe (ASCII) paragraphs. */
export function jftToText(html: string): string {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|tr|h1|h2|h3|div|table)>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
  // Standard PDF fonts encode a limited set; fold smart punctuation to ASCII.
  s = s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...");
  return s
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/** Split the reading into the heading, reading title, and body for the PDF. */
export function parseJftParts(html: string): {
  heading: string;
  title: string;
  bodyText: string;
} {
  const strip = (s: string) => s.replace(/<[^>]+>/g, "").trim();
  // The date is a plain <h2>; the reading title is the <h2 class="heading1">
  // — distinguishing by class rather than order/tag, since na.org's markup no
  // longer puts the title in an <h1>.
  const date = strip(html.match(/<h2>([\s\S]*?)<\/h2>/i)?.[1] ?? "");
  const title = strip(
    html.match(/<h2 class="heading1"[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? "",
  );
  const body = html
    .replace(/<h2>[\s\S]*?<\/h2>/i, "")
    .replace(/<h2 class="heading1"[^>]*>[\s\S]*?<\/h2>/i, "");
  const bodyText = jftToText(body);
  const datePart = date.split(",")[0].trim().toUpperCase();
  const heading = datePart ? `JUST FOR TODAY - ${datePart}` : "JUST FOR TODAY";
  return { heading, title, bodyText };
}

/** Word-wrap paragraphs to a max width, measured with the given PDF font. */
export function wrapJftLines(
  text: string,
  measure: (s: string) => number,
  maxWidth: number,
): string[] {
  const out: string[] = [];
  const paragraphs = text.split("\n");
  paragraphs.forEach((para, pIdx) => {
    let line = "";
    for (const word of para.split(" ")) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && measure(candidate) > maxWidth) {
        out.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    out.push(line);
    if (pIdx < paragraphs.length - 1) out.push(""); // blank line between paragraphs
  });
  return out;
}
