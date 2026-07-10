import { useEffect, useState } from "react";
import { Download, SlidersHorizontal } from "lucide-react";
import { api, type Deck, type Slide } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SlideViewer } from "@/components/slides/SlideViewer";
import { SlideManager } from "@/components/slides/SlideManager";

export function SlideDeckPage({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );
  const [managing, setManaging] = useState(false);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setManaging(false);
    api
      .getDeck(slug)
      .then((d) => {
        if (!active) return;
        setDeck(d);
        setStatus("ready");
      })
      .catch(() => active && setStatus("missing"));
    return () => {
      active = false;
    };
  }, [slug]);

  if (status === "loading") {
    return <p className="text-muted-foreground">Loading slides…</p>;
  }
  if (status === "missing" || !deck) {
    return <p className="text-muted-foreground">This slide deck is unavailable.</p>;
  }

  const onSlides = (slides: Slide[]) => setDeck({ ...deck, slides });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-primary">{deck.title}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={`/api/decks/${deck.slug}/download`}>
              <Download /> Download PDF
            </a>
          </Button>
          {user && (
            <Button
              variant={managing ? "default" : "secondary"}
              onClick={() => setManaging((m) => !m)}
            >
              <SlidersHorizontal /> {managing ? "Done" : "Manage"}
            </Button>
          )}
        </div>
      </div>

      <SlideViewer slides={deck.slides} />

      {user && managing && <SlideManager deck={deck} onChange={onSlides} />}
    </div>
  );
}
