import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileText, Plus, Trash2 } from "lucide-react";
import { api, ApiError, type Deck, type Slide } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SlideManager({
  deck,
  onChange,
}: {
  deck: Deck;
  onChange: (slides: Slide[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const slides = deck.slides;
  const hasJft = slides.some((s) => s.kind === "jft");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const move = (from: number, to: number) =>
    run(async () => {
      if (to < 0 || to >= slides.length) return;
      const reordered = [...slides];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      const { slides: updated } = await api.reorderSlides(
        deck.slug,
        reordered.map((s) => s.id),
      );
      onChange(updated);
    });

  const add = () =>
    run(async () => {
      const file = fileRef.current?.files?.[0];
      if (!file) {
        setError("Choose an image first.");
        return;
      }
      const slide = await api.addSlide(deck.slug, file, newAlt);
      onChange([...slides, slide]);
      setNewAlt("");
      if (fileRef.current) fileRef.current.value = "";
    });

  const addJft = () =>
    run(async () => {
      const slide = await api.addJftSlide(deck.slug);
      onChange([...slides, slide]);
    });

  const saveAlt = (slide: Slide, alt: string) =>
    run(async () => {
      const updated = await api.updateSlide(slide.id, alt);
      onChange(slides.map((s) => (s.id === slide.id ? updated : s)));
    });

  const remove = (slide: Slide) =>
    run(async () => {
      await api.deleteSlide(slide.id);
      onChange(slides.filter((s) => s.id !== slide.id));
    });

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Manage slides</h2>
        <span className="text-sm text-muted-foreground">{slides.length} slides</span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <ol className="space-y-2">
        {slides.map((slide, i) => (
          <li
            key={slide.id}
            className="flex items-center gap-3 rounded-md border border-border p-2"
          >
            {slide.kind === "jft" ? (
              <div className="jft-thumb flex h-14 w-20 shrink-0 items-center justify-center rounded p-1 text-center text-[0.6rem] font-semibold uppercase leading-tight tracking-wide text-white">
                <span>Just for Today</span>
              </div>
            ) : (
              <img
                src={slide.src ?? undefined}
                alt=""
                className="h-14 w-20 shrink-0 rounded object-cover"
              />
            )}
            <Input
              defaultValue={slide.alt}
              placeholder="Describe this slide"
              className="flex-1"
              onBlur={(e) => {
                if (e.target.value !== slide.alt) saveAlt(slide, e.target.value);
              }}
            />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Move up"
                disabled={busy || i === 0}
                onClick={() => move(i, i - 1)}
              >
                <ArrowUp />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Move down"
                disabled={busy || i === slides.length - 1}
                onClick={() => move(i, i + 1)}
              >
                <ArrowDown />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete slide"
                    disabled={busy}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this slide?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the slide from the deck. This can't be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => remove(slide)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </li>
        ))}
      </ol>

      <div className="space-y-2 rounded-md border border-dashed border-border p-3">
        <p className="text-sm font-medium">Add a slide</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <p className="text-xs text-muted-foreground">
          PNG or JPEG recommended so the slide appears in the downloadable PDF.
        </p>
        <Input
          value={newAlt}
          onChange={(e) => setNewAlt(e.target.value)}
          placeholder="Describe this slide (alt text)"
        />
        <Button onClick={add} disabled={busy}>
          <Plus /> Add slide
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed border-border p-3">
        <div>
          <p className="text-sm font-medium">Just for Today slide</p>
          <p className="text-xs text-muted-foreground">
            Shows the live daily meditation; always up to date. One per deck.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={addJft}
          disabled={busy || hasJft}
        >
          <FileText /> {hasJft ? "Already added" : "Add Just for Today"}
        </Button>
      </div>
    </section>
  );
}
