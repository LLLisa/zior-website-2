import { useSettings } from "@/lib/settings";
import { toLocalTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { settings } = useSettings();
  const start = settings
    ? toLocalTime(settings.meeting_start, settings.meeting_tz)
    : "";
  const end = settings ? toLocalTime(settings.meeting_end, settings.meeting_tz) : "";

  return (
    <footer className="sticky bottom-0 z-30 w-full bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-2 text-sm sm:flex-row">
        <p className="text-center sm:text-left">
          Meeting time (your local zone): <strong>{start}</strong> to{" "}
          <strong>{end}</strong>
        </p>
        {settings?.zoom_url && (
          <Button
            asChild
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            <a href={settings.zoom_url} target="_blank" rel="noreferrer">
              Join Zoom Meeting
            </a>
          </Button>
        )}
      </div>
    </footer>
  );
}
