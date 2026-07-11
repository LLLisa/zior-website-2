import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
} from "lucide-react";
import type { Slide } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JftSlide } from "./JftSlide";

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};
type FsElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => void;
};

function fullscreenElement(): Element | null {
  const doc = document as FsDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export function SlideViewer({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const count = slides.length;

  useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1));
  }, [count, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(count - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  // Keep local state in sync with the browser (e.g. exiting fullscreen via Esc).
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(fullscreenElement() === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current as FsElement | null;
    if (!el) return;
    if (fullscreenElement()) {
      const doc = document as FsDocument;
      (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
    } else {
      (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el);
    }
  };

  if (count === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
        This deck has no slides yet.
      </div>
    );
  }

  const slide = slides[Math.min(index, count - 1)];

  return (
    <div
      ref={containerRef}
      className={cn(isFullscreen ? "flex h-screen w-screen flex-col bg-black" : "space-y-3")}
    >
      <div
        className={cn(
          "relative flex items-center justify-center border-border bg-black/90",
          isFullscreen ? "flex-1 p-0" : "rounded-lg border p-2",
        )}
      >
        {slide.kind === "jft" ? (
          <JftSlide isFullscreen={isFullscreen} />
        ) : (
          <img
            src={slide.src ?? undefined}
            alt={slide.alt}
            className={cn(
              "object-contain",
              // Fullscreen: fill the container (object-contain keeps the aspect
              // ratio) so even small slides scale up to nearly the whole screen.
              isFullscreen ? "h-full w-full" : "max-h-[70vh] w-auto max-w-full",
            )}
          />
        )}
        {count > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous slide"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full opacity-90"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next slide"
              disabled={index === count - 1}
              onClick={() => setIndex((i) => Math.min(count - 1, i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full opacity-90"
            >
              <ChevronRight />
            </Button>
          </>
        )}
        <Button
          variant="secondary"
          size="icon"
          aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
          onClick={toggleFullscreen}
          className="absolute right-3 top-3 rounded-full opacity-90"
        >
          {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>
        {isFullscreen && (
          <div className="absolute bottom-3 right-4 rounded bg-black/60 px-2 py-1 text-sm text-white">
            {index + 1} / {count}
          </div>
        )}
      </div>
      {!isFullscreen && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{slide.alt}</span>
          <span>
            {index + 1} / {count}
          </span>
        </div>
      )}
    </div>
  );
}
