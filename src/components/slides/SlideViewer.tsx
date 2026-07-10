import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Slide } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function SlideViewer({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
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

  if (count === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
        This deck has no slides yet.
      </div>
    );
  }

  const slide = slides[Math.min(index, count - 1)];

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center rounded-lg border border-border bg-black/90 p-2">
        <img
          src={slide.src}
          alt={slide.alt}
          className="max-h-[70vh] w-auto max-w-full object-contain"
        />
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
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{slide.alt}</span>
        <span>
          {index + 1} / {count}
        </span>
      </div>
    </div>
  );
}
