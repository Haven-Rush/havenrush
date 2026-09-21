/**
 * Client-side pass token persistence, keyed by event slug (an attendee can
 * hold passes for more than one event, so a single global slot would let
 * a second RSVP silently clobber the first). No login, no server session —
 * this is the only place a pass token survives between visits.
 *
 * Keyed by slug rather than the Prisma id: RsvpFlow only has the slug on
 * hand (POST /api/rsvp's response doesn't include an id, and there's no
 * reason to widen that response just for this), and the passport/scan
 * pages both already load the event's slug alongside its id, so slug is
 * the one identifier available at every call site without extra plumbing.
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

export function getStoredPassToken(eventSlug: string): string | null {
  return readAll()[eventSlug] ?? null;
}

export function storePassToken(eventSlug: string, passToken: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = readAll();
    all[eventSlug] = passToken;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage can throw (private browsing, storage quota, etc.) —
    // persistence here is a convenience, not a requirement.
  }
}
