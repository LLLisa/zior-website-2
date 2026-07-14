import { useRef, useState } from "react";
import { Check, Pencil, Trash2, Upload } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { EditableArticle } from "@/components/EditableArticle";
import { Button } from "@/components/ui/button";
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

// The 7th Tradition slide is stored on its own (a single image in settings, like
// the QR code) and shown full width below the page text.
function SeventhTraditionSlide() {
  const { user } = useAuth();
  const { settings, setSettings } = useSettings();
  const [editMode, setEditMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const url = settings?.seventhTraditionUrl ?? null;

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      setSettings(await api.replaceSeventhTradition(file));
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not upload.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setError("");
    try {
      setSettings(await api.removeSeventhTradition());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove.");
    }
  };

  // Nothing to show and nothing to manage.
  if (!url && !user) return null;

  return (
    <section className="pt-2">
      {user && (
        <div className="mb-2 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditMode((e) => !e);
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
        </div>
      )}

      {url && (
        <img
          src={url}
          alt="7th Tradition"
          className="w-full rounded-lg border border-border"
        />
      )}

      {user && editMode && (
        <div className="mt-3 space-y-2 rounded-lg border border-dashed border-border p-4">
          <p className="text-sm font-medium">
            {url ? "Replace the 7th Tradition slide" : "Add a 7th Tradition slide"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={upload} disabled={busy}>
              <Upload /> {busy ? "Uploading…" : url ? "Replace image" : "Upload image"}
            </Button>
            {url && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 /> Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove the 7th Tradition slide?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The image will no longer appear on this page. You can upload a new
                      one anytime.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={remove}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export function SeventhTradition() {
  return (
    <div className="space-y-6">
      <EditableArticle slug="seventh-tradition" afterBody={<SeventhTraditionSlide />} />
    </div>
  );
}
