import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Pencil, Save, X } from "lucide-react";
import { api, ApiError, type Page } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SafeHtml } from "@/components/SafeHtml";

// The editor (Tiptap) is only needed by signed-in editors, so load it on demand.
const RichTextEditor = lazy(() =>
  import("@/components/editor/RichTextEditor").then((m) => ({
    default: m.RichTextEditor,
  })),
);

/**
 * Renders a CMS page. Signed-in users get an inline edit mode (title + body).
 * `afterTitle` / `afterBody` inject fixed, non-editable content around the body.
 */
export function EditableArticle({
  slug,
  afterTitle,
  afterBody,
}: {
  slug: string;
  afterTitle?: ReactNode;
  afterBody?: ReactNode;
}) {
  const { user } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    api
      .getPage(slug)
      .then((p) => {
        if (!active) return;
        setPage(p);
        setStatus("ready");
      })
      .catch(() => active && setStatus("missing"));
    return () => {
      active = false;
    };
  }, [slug]);

  const startEditing = () => {
    if (!page) return;
    setTitle(page.title);
    setBody(page.body);
    setError("");
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await api.savePage(slug, title, body);
      setPage(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return <p className="text-muted-foreground">Loading…</p>;
  }
  if (status === "missing" || !page) {
    return <p className="text-muted-foreground">This page is unavailable.</p>;
  }

  if (editing) {
    return (
      <article className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="page-title">Page title</Label>
          <Input
            id="page-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Content</Label>
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading editor…</p>
            }
          >
            <RichTextEditor value={page.body} onChange={setBody} />
          </Suspense>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>
            <Save /> {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditing(false)}
            disabled={saving}
          >
            <X /> Cancel
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary">{page.title}</h1>
        {user && (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Pencil /> Edit
          </Button>
        )}
      </div>
      {afterTitle}
      <SafeHtml html={page.body} />
      {afterBody}
    </article>
  );
}
