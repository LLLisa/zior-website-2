import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { api, ApiError, type Script } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

// Lazy so pdf.js (a large dependency) only loads when a script is actually viewed.
const PdfViewer = lazy(() => import("@/components/PdfViewer"));

export function ScriptPage({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [script, setScript] = useState<Script | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setError("");
    api
      .getScript(slug)
      .then((s) => {
        if (!active) return;
        setScript(s);
        setStatus("ready");
      })
      .catch(() => active && setStatus("missing"));
    return () => {
      active = false;
    };
  }, [slug]);

  const replace = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a PDF first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const updated = await api.replaceScript(slug, file);
      // Cache-bust the inline viewer by forcing a re-render.
      setScript({ ...updated });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not upload.");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") {
    return <p className="text-muted-foreground">Loading…</p>;
  }
  if (status === "missing" || !script) {
    return <p className="text-muted-foreground">This script is unavailable.</p>;
  }

  const viewerSrc = script.fileUrl ? `${script.fileUrl}?v=${script.updatedAt}` : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-primary">{script.title}</h1>
        {script.hasFile && (
          <Button asChild variant="outline">
            <a href={`/api/scripts/${script.slug}/file?download=1`}>
              <Download /> Download PDF
            </a>
          </Button>
        )}
      </div>

      {viewerSrc ? (
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading viewer…</p>
          }
        >
          <PdfViewer src={viewerSrc} />
        </Suspense>
      ) : (
        <p className="text-muted-foreground">No script has been uploaded yet.</p>
      )}

      {user && (
        <section className="space-y-2 rounded-lg border border-dashed border-border p-4">
          <p className="text-sm font-medium">Replace this script</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={replace} disabled={busy}>
            <Upload /> {busy ? "Uploading…" : "Upload new PDF"}
          </Button>
        </section>
      )}
    </div>
  );
}
