import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, FileText, Pencil, Plus, Presentation, Trash2, X } from "lucide-react";
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

type Material = {
  type: "script" | "deck";
  slug: string;
  title: string;
  to: string;
};

// Scripts and decks live in separate tables, so a script and a deck can share a
// slug (e.g. both "daily"). Key the UI by type + slug to keep them distinct.
const keyOf = (m: Material) => `${m.type}:${m.slug}`;

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

  const materials: Material[] = [
    ...scripts.map((s) => ({
      type: "script" as const,
      slug: s.slug,
      title: s.title,
      to: `/scripts/${s.slug}`,
    })),
    ...decks.map((d) => ({
      type: "deck" as const,
      slug: d.slug,
      title: d.title,
      to: `/decks/${d.slug}`,
    })),
  ].sort((a, b) => a.title.localeCompare(b.title));

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
        const created = await api.createScript(t, fileRef.current?.files?.[0] ?? null);
        setScripts((list) => [...list, created]);
      } else {
        const created = await api.createDeck(t);
        setDecks((list) => [...list, created]);
      }
      resetAdd();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add material.");
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
        setScripts((list) => list.map((x) => (x.slug === m.slug ? updated : x)));
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

  return (
    <section className="pt-2">
      <div className="mb-3 flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-primary">Service materials</h2>
        {user && (
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
        )}
      </div>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {materials.map((m) => {
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
                    <Link
                      to={m.to}
                      className="flex flex-1 items-center gap-3 p-4 font-medium"
                    >
                      <Icon className="size-5 shrink-0 text-primary" />
                      {m.title}
                    </Link>
                    {editMode && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Rename ${m.title}`}
                          onClick={() => startEdit(m)}
                        >
                          <Pencil />
                        </Button>
                        <AlertDialog>
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
          })}
        </div>
      )}

      {user && editMode && (
        <div className="mt-4">
          {adding === null ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setAdding("script");
                  setError("");
                }}
              >
                <Plus /> Add script
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setAdding("deck");
                  setError("");
                }}
              >
                <Plus /> Add slide deck
              </Button>
            </div>
          ) : (
            <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
              <p className="text-sm font-medium">
                {adding === "script" ? "Add a script" : "Add a slide deck"}
              </p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && adding === "deck") create();
                }}
                placeholder={
                  adding === "script"
                    ? "e.g. Daily Meeting Script"
                    : "e.g. Daily Meeting Slides"
                }
                autoFocus
              />
              {adding === "script" ? (
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
          )}
        </div>
      )}
    </section>
  );
}
