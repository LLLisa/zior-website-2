import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { FileText, Minus, Plus, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// A script viewer with two modes:
//   Page view  – renders the PDF pages to canvas, zoomable; faithful layout.
//   Text view  – extracts the PDF's text and reflows it as normal web text that
//                wraps to the screen and scales with a text-size control, so
//                enlarging never needs horizontal scrolling. Best for readers
//                who need large text; formatting is approximated.
type Mode = "page" | "text";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1; // 10% of the 100% base per click
const MIN_TEXT = 1; // rem
const MAX_TEXT = 3;
const TEXT_STEP = 0.125; // 0.125 / TEXT_BASE = 10% per click
const TEXT_BASE = 1.25; // rem shown as 100%
const PADDING = 24; // matches the body wrapper's horizontal padding (p-3 * 2)

type TItem = { str: string; transform: number[] };
const isTextItem = (it: unknown): it is TItem =>
  !!it &&
  typeof (it as { str?: unknown }).str === "string" &&
  Array.isArray((it as { transform?: unknown }).transform);

// Rebuild readable paragraphs from a page's positioned text runs: bucket runs
// into lines by vertical position, order top-to-bottom / left-to-right, then
// join lines into paragraphs, breaking where the vertical gap jumps. Wrapped
// lines rejoin so the browser can re-wrap them at any text size.
function paragraphsFromItems(items: unknown[]): string[] {
  const runs = items.filter(isTextItem);
  if (!runs.length) return [];
  const Y_TOL = 3;
  const buckets: Array<{ y: number; runs: Array<{ x: number; str: string }> }> = [];
  for (const r of runs) {
    const y = r.transform[5];
    const x = r.transform[4];
    let b = buckets.find((bk) => Math.abs(bk.y - y) <= Y_TOL);
    if (!b) {
      b = { y, runs: [] };
      buckets.push(b);
    }
    b.runs.push({ x, str: r.str });
  }
  const lines = buckets
    .sort((a, b) => b.y - a.y)
    .map((b) => ({
      y: b.y,
      text: b.runs
        .sort((p, q) => p.x - q.x)
        .map((p) => p.str)
        .join("")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((l) => l.text.length);
  if (!lines.length) return [];

  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) gaps.push(Math.abs(lines[i - 1].y - lines[i].y));
  const sorted = [...gaps].sort((a, b) => a - b);
  const medianGap = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;

  const paras: string[] = [];
  let cur = lines[0].text;
  for (let i = 1; i < lines.length; i++) {
    const gap = Math.abs(lines[i - 1].y - lines[i].y);
    if (medianGap > 0 && gap > medianGap * 1.6) {
      paras.push(cur);
      cur = lines[i].text;
    } else {
      cur += " " + lines[i].text;
    }
  }
  paras.push(cur);
  return paras.map((p) => p.trim()).filter(Boolean);
}

export default function PdfViewer({ src }: { src: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mode, setMode] = useState<Mode>("page");
  const [zoom, setZoom] = useState(1);
  const [textRem, setTextRem] = useState(TEXT_BASE);
  const [fitWidth, setFitWidth] = useState(0);
  const [paragraphs, setParagraphs] = useState<string[] | null>(null);

  // Load (and tear down) the document.
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setDoc(null);
    setParagraphs(null);
    const task = pdfjs.getDocument(src);
    task.promise.then(
      (d) => {
        if (cancelled) {
          d.destroy();
          return;
        }
        setDoc(d);
        setNumPages(d.numPages);
        setStatus("ready");
      },
      () => !cancelled && setStatus("error"),
    );
    return () => {
      cancelled = true;
      task.destroy();
    };
  }, [src]);

  // Extract text once per document (used by Text view).
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    (async () => {
      const out: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        if (cancelled) return;
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        out.push(...paragraphsFromItems(content.items));
      }
      if (!cancelled) setParagraphs(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [doc]);

  // Track the column width so page-view 100% fits it.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setFitWidth(el.clientWidth - PADDING);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [status]);

  // Render page-view canvases at the current scale; cancel in-flight work on
  // change. Re-runs when returning to Page view so freshly mounted canvases draw.
  useEffect(() => {
    if (mode !== "page" || !doc || fitWidth <= 0) return;
    let cancelled = false;
    const tasks: RenderTask[] = [];
    (async () => {
      const dpr = window.devicePixelRatio || 1;
      for (let i = 1; i <= doc.numPages; i++) {
        if (cancelled) return;
        const page = await doc.getPage(i);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const scale = (fitWidth / base.width) * zoom;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRefs.current[i - 1];
        if (!canvas) continue;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        const task = page.render({
          canvas,
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        });
        tasks.push(task);
        try {
          await task.promise;
        } catch {
          return; // render cancelled by cleanup
        }
      }
    })();
    return () => {
      cancelled = true;
      tasks.forEach((t) => t.cancel());
    };
  }, [doc, zoom, fitWidth, mode]);

  const clampZoom = (z: number) =>
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(z.toFixed(2)))));
  const clampText = (r: number) =>
    // 3 decimals so the 0.125rem step (e.g. 1.375) isn't rounded off, which
    // would make the displayed percentage drift off clean 10% increments.
    setTextRem(Math.min(MAX_TEXT, Math.max(MIN_TEXT, Number(r.toFixed(3)))));

  return (
    <div
      // On wide screens let the viewer break ~5% past the page's content column
      // on each side (10% wider overall) so the script renders larger. Gated at
      // lg, where the centered layout has ample margin, so narrower screens and
      // the rest of the page are untouched.
      className="rounded-lg border border-border lg:-mx-[5%] lg:w-[110%]"
      role="region"
      aria-label="Script document viewer"
    >
      <div className="flex flex-wrap items-center gap-2 rounded-t-lg border-b border-border bg-card p-2">
        {/* View toggle */}
        <div className="flex overflow-hidden rounded-md border border-border">
          <Button
            size="sm"
            variant={mode === "page" ? "default" : "ghost"}
            className="rounded-none"
            onClick={() => setMode("page")}
            aria-pressed={mode === "page"}
          >
            <FileText /> Page
          </Button>
          <Button
            size="sm"
            variant={mode === "text" ? "default" : "ghost"}
            className="rounded-none"
            onClick={() => setMode("text")}
            aria-pressed={mode === "text"}
          >
            <ScrollText /> Text
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {mode === "page" ? (
            <>
              <Button
                size="icon"
                variant="outline"
                onClick={() => clampZoom(zoom - ZOOM_STEP)}
                disabled={zoom <= MIN_ZOOM}
                aria-label="Zoom out"
              >
                <Minus />
              </Button>
              <span className="min-w-[3.5rem] text-center text-sm tabular-nums text-muted-foreground" aria-live="polite">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => clampZoom(zoom + ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
                aria-label="Zoom in"
              >
                <Plus />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="outline"
                onClick={() => clampText(textRem - TEXT_STEP)}
                disabled={textRem <= MIN_TEXT}
                aria-label="Smaller text"
              >
                <Minus />
              </Button>
              <span className="min-w-[3.5rem] text-center text-sm tabular-nums text-muted-foreground" aria-live="polite">
                {Math.round((textRem / TEXT_BASE) * 100)}%
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => clampText(textRem + TEXT_STEP)}
                disabled={textRem >= MAX_TEXT}
                aria-label="Larger text"
              >
                <Plus />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Body. Page view grows the whole page and contains sideways zoom here;
          Text view wraps to the width (no horizontal scrolling). */}
      <div ref={wrapRef} className="overflow-x-auto rounded-b-lg bg-secondary/30 p-3">
        {status === "loading" && <p className="text-sm text-muted-foreground">Loading script…</p>}
        {status === "error" && (
          <p className="text-sm text-destructive">This script could not be displayed.</p>
        )}

        {status === "ready" &&
          mode === "page" &&
          Array.from({ length: numPages }, (_, i) => (
            <canvas
              key={i}
              ref={(el) => {
                canvasRefs.current[i] = el;
              }}
              className="mb-4 block max-w-none rounded bg-white shadow last:mb-0"
              aria-label={`Page ${i + 1} of ${numPages}`}
              role="img"
            />
          ))}

        {status === "ready" && mode === "text" && (
          <div className="rounded bg-white p-4 shadow sm:p-6">
            {paragraphs === null ? (
              <p className="text-sm text-muted-foreground">Preparing text…</p>
            ) : paragraphs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This PDF has no selectable text (it may be scanned). Use Page view or the
                Download button.
              </p>
            ) : (
              <div
                className="mx-auto max-w-3xl leading-relaxed text-foreground"
                style={{ fontSize: `${textRem}rem` }}
              >
                {paragraphs.map((p, i) => (
                  <p key={i} className="mb-[0.8em] last:mb-0">
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
