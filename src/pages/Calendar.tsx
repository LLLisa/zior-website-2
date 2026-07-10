import { useSettings } from "@/lib/settings";

export function Calendar() {
  const { settings } = useSettings();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-primary">Calendar</h1>
      {settings?.calendar_embed_src ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <iframe
            title="ZIOR calendar"
            src={settings.calendar_embed_src}
            className="h-[600px] w-full"
          />
        </div>
      ) : (
        <p className="text-muted-foreground">No calendar configured.</p>
      )}
    </div>
  );
}
