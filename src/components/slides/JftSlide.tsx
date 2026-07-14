import { useEffect, useLayoutEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { fetchJftText, peekJftText } from "@/lib/jftText";

const DESIGN_W = 1280;
const DESIGN_H = 720;
const BASE_FONT = 24; // px at design size; auto-fit shrinks this to fit

type Parsed = { heading: string; reading: string; bodyHtml: string };

// Restructure the raw jftna.org markup into the slide's layout: a yellow
// "JUST FOR TODAY – DATE" header, the white reading title, then the body.
function parseJft(raw: string): Parsed {
  const doc = new DOMParser().parseFromString(raw, "text/html");
  const h2 = doc.querySelector("h2");
  const h1 = doc.querySelector("h1");
  const dateStr = h2?.textContent?.trim() ?? "";
  const reading = h1?.textContent?.trim() ?? "";

  // Drop the pieces we render ourselves or that the sample omits.
  h2?.closest("tr")?.remove();
  h1?.closest("tr")?.remove();
  doc.querySelector('a[href*="na.org"]')?.closest("tr")?.remove();
  doc.querySelectorAll("td").forEach((td) => {
    if (/^\s*Page\s+\d+/i.test(td.textContent ?? "")) td.closest("tr")?.remove();
  });

  const table = doc.querySelector("table");
  const bodyHtml = table ? table.outerHTML : doc.body.innerHTML;
  const datePart = dateStr.split(",")[0].trim().toUpperCase();
  const heading = datePart ? `JUST FOR TODAY – ${datePart}` : "JUST FOR TODAY";
  return { heading, reading, bodyHtml };
}

// The live "Just for Today" reading composed on a fixed 1280x720 canvas that
// scales as one unit to fit the slide frame (contain, centered) — so it matches
// the image slides and fullscreen is just larger, not reflowed.
export function JftSlide({ isFullscreen = false }: { isFullscreen?: boolean }) {
  // Initialize from the prefetched cache when available, so a deck that warmed it
  // shows the reading immediately with no loading flash.
  const [parsed, setParsed] = useState<Parsed | null>(() => {
    const t = peekJftText();
    return t ? parseJft(t) : null;
  });
  const [failed, setFailed] = useState(false);
  const [scale, setScale] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parsed) return; // already have it (prefetched)
    let active = true;
    fetchJftText()
      .then((t) => active && setParsed(parseJft(t)))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [parsed]);

  // Contain-scale the fixed canvas into the wrapper (matches image object-fit).
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () =>
      setScale(Math.min(el.clientWidth / DESIGN_W, el.clientHeight / DESIGN_H));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Shrink the base font until the whole reading fits within the canvas height.
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner || !parsed) return;
    const fit = () => {
      let size = BASE_FONT;
      inner.style.fontSize = `${size}px`;
      let guard = 0;
      while (inner.scrollHeight > DESIGN_H && size > 9 && guard < 80) {
        size -= 1;
        inner.style.fontSize = `${size}px`;
        guard++;
      }
    };
    fit();
    // Re-fit once the webfont loads, since metrics change.
    document.fonts?.ready.then(fit).catch(() => {});
  }, [parsed]);

  return (
    <div
      ref={wrapperRef}
      className={cnWrapper(isFullscreen)}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        className="jft-canvas"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        <div ref={innerRef} className="jft-slide-inner" style={{ fontSize: BASE_FONT }}>
          {failed ? (
            <div className="jft-title">Just For Today is unavailable right now.</div>
          ) : !parsed ? (
            <div className="jft-title">Loading today's meditation…</div>
          ) : (
            <>
              <div className="jft-title">{parsed.heading}</div>
              {parsed.reading && (
                <h1 className="jft-reading-title">{parsed.reading}</h1>
              )}
              <div
                className="jft-body"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(parsed.bodyHtml),
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// The wrapper is full-width and either 70vh tall (normal) or fills the screen
// (fullscreen); the canvas is contained and centered within it, like an image.
function cnWrapper(isFullscreen: boolean) {
  return isFullscreen ? "h-full w-full" : "h-[70vh] w-full";
}
