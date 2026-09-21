/**
 * Client-side pass token persistence, keyed by event id (an attendee can
 * hold passes for more than one event, so a single global slot would let
 * a second RSVP silently clobber the first). No login, no server session —
 * this is the only place a pass token survives between visits.
 *
 * Safe to import from a server context (all functions no-op there) but
 * only ever meaningful when actually called client-side.
 */
const STORAGE_KEY = "hr_passes";

type StoredPasses = Record<string, string>;

function readAll(): StoredPasses {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as StoredPasses) : {};
  } catch {
    return {};
  }
}

export function getStoredPassToken(eventId: string): string | null {
  return readAll()[eventId] ?? null;
}

export function storePassToken(eventId: string, passToken: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = readAll();
    all[eventId] = passToken;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage can throw (private browsing, storage quota, etc.) —
    // persistence here is a convenience, not a requirement.
  }
}
