import { useSettings } from "@/lib/settings";
import { toLocalTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function JoinCard() {
  const { settings } = useSettings();
  if (!settings) return null;

  const start = toLocalTime(settings.meeting_start, settings.meeting_tz);
  const end = toLocalTime(settings.meeting_end, settings.meeting_tz);

  return (
    <Card className="bg-secondary/50">
      <CardContent className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            Every day · 7:00–8:00 PM Eastern
          </p>
          <p className="text-lg font-semibold">
            {start} – {end} <span className="font-normal">your local time</span>
          </p>
          {settings.zoom_url && (
            <Button asChild className="mt-3">
              <a href={settings.zoom_url} target="_blank" rel="noreferrer">
                Join Zoom Meeting
              </a>
            </Button>
          )}
        </div>
        {settings.qrUrl && (
          <img
            src={settings.qrUrl}
            alt="Scan to join the Zoom meeting"
            className="h-28 w-28 rounded-md border border-border bg-white p-1"
          />
        )}
      </CardContent>
    </Card>
  );
}
