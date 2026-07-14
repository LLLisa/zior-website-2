// Client-side cache of the raw "Just for Today" HTML from the /jftText proxy.
// Keyed on the US/Eastern calendar day (matching the server cache) so it
// refreshes when the reading rolls over. Deck views prefetch it on navigation so
// the on-screen slide can render immediately instead of showing a loading flash.

let cache: { day: string; promise: Promise<string> } | null = null;
let resolved: { day: string; text: string } | null = null;

function easternDay(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function fetchJftText(): Promise<string> {
  const day = easternDay();
  if (!cache || cache.day !== day) {
    resolved = null;
    const promise = fetch("/jftText")
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("JFT unavailable"))))
      .then((text) => {
        resolved = { day, text };
        return text;
      });
    // Don't leave a rejected promise cached, so a later view can retry.
    promise.catch(() => {
      if (cache?.promise === promise) cache = null;
    });
    cache = { day, promise };
  }
  return cache.promise;
}

/** Synchronously return today's text if it's already loaded, else null. */
export function peekJftText(): string | null {
  return resolved && resolved.day === easternDay() ? resolved.text : null;
}

/** Warm the cache ahead of time; failures are swallowed (the slide will retry). */
export function prefetchJftText(): void {
  void fetchJftText().catch(() => {});
}
