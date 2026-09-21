/**
 * Converts between a stored UTC `Date` and an HTML `<input type="datetime-
 * local">` value, treating the wall-clock time as America/Chicago — same
 * zone lib/events-db.ts formats event dates in. Placeholder data is
 * Austin-only for now (see CLAUDE.md); this should become per-event once
 * markets outside Central time are seeded.
 */
const TIME_ZONE = "America/Chicago";

/** Stored UTC Date -> "YYYY-MM-DDTHH:mm" as it reads on a clock in TIME_ZONE. */
export function toDateTimeLocalValue(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/**
 * "YYYY-MM-DDTHH:mm" (meant as a TIME_ZONE wall-clock time) -> the UTC
 * Date it corresponds to. Round-trips through Intl to get the correct
 * offset for that specific date (so DST transitions resolve correctly)
 * without a timezone library: treat the string as if it were UTC, see
 * what wall-clock time that instant shows in TIME_ZONE, and shift by the
 * gap between the two.
 */
export function fromDateTimeLocalValue(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return null;

  const asUtc = new Date(`${value}:00Z`);
  if (Number.isNaN(asUtc.getTime())) return null;

  const shownInZone = toDateTimeLocalValue(asUtc);
  const shownAsUtc = new Date(`${shownInZone}:00Z`);
  const offsetMs = shownAsUtc.getTime() - asUtc.getTime();

  return new Date(asUtc.getTime() - offsetMs);
}
