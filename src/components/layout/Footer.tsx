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
    <footer className="w-full shrink-0 border-t border-white/10 bg-primary text-primary-foreground shadow-[0_-2px_10px_rgba(0,0,0,0.12)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-2.5 text-sm sm:flex-row">
        <p className="text-center text-primary-foreground/85 sm:text-left">
          Meeting time (local):{" "}
          <strong className="text-primary-foreground">{start}</strong> to{" "}
          <strong className="text-primary-foreground">{end}</strong>
        </p>
        {settings?.zoom_url && (
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="w-full bg-white font-semibold text-primary shadow-sm hover:bg-white/90 sm:w-auto"
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
