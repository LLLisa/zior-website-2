import { useEffect, useRef, useState } from "react";
import { Save, Upload } from "lucide-react";
import { api, ApiError, type Settings } from "@/lib/api";
import { useSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELDS: Array<{ key: keyof Settings; label: string; hint?: string }> = [
  { key: "site_title", label: "Site title" },
  { key: "zoom_url", label: "Zoom meeting URL" },
  { key: "meeting_start", label: "Meeting start (24h, e.g. 19:00)" },
  { key: "meeting_end", label: "Meeting end (24h, e.g. 20:00)" },
  {
    key: "meeting_tz",
    label: "Meeting timezone",
    hint: "An IANA name such as America/New_York.",
  },
  { key: "calendar_embed_src", label: "Google Calendar embed URL" },
];

export function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const [form, setForm] = useState<Settings | null>(settings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const qrRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings, form]);

  if (!form) {
    return <p className="text-muted-foreground">Loading settings…</p>;
  }

  const update = (key: keyof Settings, value: string) =>
    setForm({ ...form, [key]: value });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const values: Partial<Settings> = {};
      for (const { key } of FIELDS) values[key] = form[key] as never;
      const updated = await api.saveSettings(values);
      setSettings(updated);
      setForm(updated);
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const uploadQr = async () => {
    const file = qrRef.current?.files?.[0];
    if (!file) return;
    setError("");
    setMessage("");
    try {
      const updated = await api.replaceQr(file);
      setSettings(updated);
      setForm(updated);
      setMessage("QR code updated.");
      if (qrRef.current) qrRef.current.value = "";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not upload.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Site settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          These control the meeting details shown across the site.
        </p>
      </div>

      <form onSubmit={save} className="space-y-4">
        {FIELDS.map(({ key, label, hint }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              value={(form[key] as string) ?? ""}
              onChange={(e) => update(key, e.target.value)}
            />
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
        ))}

        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-primary">{message}</p>}

        <Button type="submit" disabled={saving}>
          <Save /> {saving ? "Saving…" : "Save settings"}
        </Button>
      </form>

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div>
          <p className="font-medium">Zoom QR code</p>
          <p className="text-sm text-muted-foreground">
            Shown on the home page so members can join from their phones.
          </p>
        </div>
        {form.qrUrl && (
          <img
            src={form.qrUrl}
            alt="Current QR code"
            className="h-28 w-28 rounded-md border border-border bg-white p-1"
          />
        )}
        <input
          ref={qrRef}
          type="file"
          accept="image/png,image/jpeg"
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <Button type="button" variant="outline" onClick={uploadQr}>
          <Upload /> Upload new QR code
        </Button>
      </div>
    </div>
  );
}
