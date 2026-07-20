import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  FileText,
  Pencil,
  Plus,
  Presentation,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api, ApiError, type Deck, type Script } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Material = {
  type: "script" | "deck";
  slug: string;
  title: string;
  to: string;
  updatedAt: string | null;
};

// Scripts and decks live in separate tables, so a script and a deck can share a
// slug (e.g. both "daily"). Key the UI by type + slug to keep them distinct.
const keyOf = (m: Material) => `${m.type}:${m.slug}`;

// "Jul 20, 2026". Empty for a missing or unparseable date.
function formatUpdated(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ServiceMaterials() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [adding, setAdding] = useState<null | "script" | "deck">(null);
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // One shared file input serves every row; replacingSlug says which script the
  // pending pick belongs to.
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replacingSlug, setReplacingSlug] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.listScripts(), api.listDecks()])
      .then(([s, d]) => {
        if (!active) return;
        setScripts(s);
        setDecks(d);
      })
      .catch(() => active && setError("Could not load service materials."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const byTitle = (a: Material, b: Material) => a.title.localeCompare(b.title);
  const scriptMaterials: Material[] = scripts
    .map((s) => ({
      type: "script" as const,
      slug: s.slug,
      title: s.title,
      to: `/scripts/${s.slug}`,
      updatedAt: s.updatedAt,
    }))
    .sort(byTitle);
  const deckMaterials: Material[] = decks
    .map((d) => ({
      type: "deck" as const,
      slug: d.slug,
      title: d.title,
      to: `/decks/${d.slug}`,
      updatedAt: d.updatedAt,
    }))
    .sort(byTitle);

  const resetAdd = () => {
    setAdding(null);
    setTitle("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const create = async () => {
    const t = title.trim();
    if (!t) {
      setError("Enter a title.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (adding === "script") {
        const created = await api.createScript(
          t,
          fileRef.current?.files?.[0] ?? null,
        );
        setScripts((list) => [...list, created]);
      } else {
        const created = await api.createDeck(t);
        setDecks((list) => [...list, created]);
      }
      resetAdd();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not add material.",
      );
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (m: Material) => {
    setEditingKey(keyOf(m));
    setEditTitle(m.title);
    setError("");
  };

  const saveEdit = async (m: Material) => {
    const t = editTitle.trim();
    if (!t) {
      setError("Enter a title.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (m.type === "script") {
        const updated = await api.renameScript(m.slug, t);
        setScripts((list) =>
          list.map((x) => (x.slug === m.slug ? updated : x)),
        );
      } else {
        const updated = await api.renameDeck(m.slug, t);
        setDecks((list) => list.map((x) => (x.slug === m.slug ? updated : x)));
      }
      setEditingKey(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not rename.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (m: Material) => {
    setError("");
    try {
      if (m.type === "script") {
        await api.deleteScript(m.slug);
        setScripts((list) => list.filter((x) => x.slug !== m.slug));
      } else {
        await api.deleteDeck(m.slug);
        setDecks((list) => list.filter((x) => x.slug !== m.slug));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete.");
    }
  };

  const pickReplacement = (m: Material) => {
    setError("");
    setReplacingSlug(m.slug);
    replaceRef.current?.click();
  };

  const replace = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const slug = replacingSlug;
    // Clear the input so picking the same file twice still fires onChange.
    e.target.value = "";
    setReplacingSlug(null);
    if (!file || !slug) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api.replaceScript(slug, file);
      setScripts((list) => list.map((x) => (x.slug === slug ? updated : x)));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not replace the PDF.",
      );
    } finally {
      setBusy(false);
    }
  };

  const renderCard = (m: Material) => {
    const Icon = m.type === "script" ? FileText : Presentation;
    const editing = editingKey === keyOf(m);
    return (
      <Card key={keyOf(m)} className="transition-colors hover:bg-secondary/50">
        {editing ? (
          <div className="flex items-center gap-2 p-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(m);
                if (e.key === "Escape") setEditingKey(null);
              }}
              autoFocus
              aria-label="New title"
              className="h-8"
            />
            <Button
              size="icon"
              variant="ghost"
              aria-label="Save"
              disabled={busy}
              onClick={() => saveEdit(m)}
            >
              <Check />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Cancel"
              onClick={() => setEditingKey(null)}
            >
              <X />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 pr-1">
            <Link to={m.to} className="flex flex-1 items-center gap-3 p-4">
              <Icon className="size-5 shrink-0 text-primary" />
              <span className="flex flex-col">
                <span className="font-medium">{m.title}</span>
                {formatUpdated(m.updatedAt) && (
                  <span className="text-xs text-muted-foreground">
                    Updated {formatUpdated(m.updatedAt)}
                  </span>
                )}
              </span>
            </Link>
            {editMode && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Rename ${m.title}`}
                      onClick={() => startEdit(m)}
                    >
                      <Pencil />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rename</TooltipContent>
                </Tooltip>
                {m.type === "script" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Replace the PDF for ${m.title}`}
                        disabled={busy}
                        onClick={() => pickReplacement(m)}
                      >
                        <Upload />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Replace PDF</TooltipContent>
                  </Tooltip>
                )}
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Delete ${m.title}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete “{m.title}”?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the{" "}
                        {m.type === "script" ? "script" : "slide deck"} and any
                        uploaded files. This can't be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => remove(m)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        )}
      </Card>
    );
  };

  // The per-column add affordance: a "+ Add …" button, or the inline create
  // form when this column's type is the one being added.
  const renderAdd = (type: "script" | "deck") => {
    if (!user || !editMode) return null;
    if (adding !== type) {
      return (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            setAdding(type);
            setError("");
          }}
        >
          <Plus /> {type === "script" ? "Add script" : "Add slide deck"}
        </Button>
      );
    }
    return (
      <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
        <p className="text-sm font-medium">
          {type === "script" ? "Add a script" : "Add a slide deck"}
        </p>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && type === "deck") create();
          }}
          placeholder={
            type === "script"
              ? "e.g. Daily Meeting Script"
              : "e.g. Daily Meeting Slides"
          }
          autoFocus
        />
        {type === "script" ? (
          <div className="space-y-1">
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <p className="text-xs text-muted-foreground">
              Optional — you can upload the PDF now or later from the script's
              page.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Create the deck, then open it to add slides.
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={create} disabled={busy}>
            <Plus /> {busy ? "Adding…" : "Create"}
          </Button>
          <Button variant="ghost" onClick={resetAdd} disabled={busy}>
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={300}>
      <section className="pt-2">
        <input
          ref={replaceRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={replace}
        />
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-primary">
            Service materials
          </h2>
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditMode((e) => !e);
                    setAdding(null);
                    setEditingKey(null);
                    setError("");
                  }}
                >
                  {editMode ? (
                    <>
                      <Check /> Done
                    </>
                  ) : (
                    <>
                      <Pencil /> Edit
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {editMode
                  ? "Finish editing service materials"
                  : "Add, rename, or remove service materials"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid items-start gap-x-6 gap-y-3 sm:grid-cols-2">
            {/* Scripts column (left) */}
            <div className="space-y-3">
              {scriptMaterials.length === 0 && !(user && editMode) && (
                <p className="text-sm text-muted-foreground">No scripts yet.</p>
              )}
              {scriptMaterials.map(renderCard)}
              {renderAdd("script")}
            </div>
            {/* Slide decks column (right) */}
            <div className="space-y-3">
              {deckMaterials.length === 0 && !(user && editMode) && (
                <p className="text-sm text-muted-foreground">
                  No slide decks yet.
                </p>
              )}
              {deckMaterials.map(renderCard)}
              {renderAdd("deck")}
            </div>
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}
