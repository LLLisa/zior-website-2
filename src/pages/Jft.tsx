import { useEffect, useState } from "react";
import { SafeHtml } from "@/components/SafeHtml";
import { Card, CardContent } from "@/components/ui/card";

export function Jft() {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/jftText")
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((text) => active && setHtml(text))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-primary">Just For Today</h1>
      <Card>
        <CardContent className="p-6">
          {failed ? (
            <p className="text-muted-foreground">
              Just For Today is unavailable right now. Please try again later.
            </p>
          ) : html === null ? (
            <p className="text-muted-foreground">Loading today's meditation…</p>
          ) : (
            <SafeHtml html={html} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
