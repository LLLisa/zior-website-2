// Convert a wall-clock "HH:mm" in a given IANA timezone to the visitor's local
// time, using only the built-in Intl APIs (no date library).

function tzOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value]),
  );
  const asUTC = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour === 24 ? 0 : +parts.hour,
    +parts.minute,
    +parts.second,
  );
  return asUTC - date.getTime();
}

function instantForTzWallTime(hhmm: string, timeZone: string): Date | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  const now = new Date();
  const [y, mo, da] = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);
  const guess = new Date(Date.UTC(y, mo - 1, da, hh, mm));
  return new Date(guess.getTime() - tzOffsetMs(timeZone, guess));
}

export function toLocalTime(hhmm: string, timeZone: string): string {
  const instant = instantForTzWallTime(hhmm, timeZone);
  if (!instant) return hhmm;
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(instant);
}
