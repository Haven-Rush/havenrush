# Decisions & assumptions

## Correction: Event.purpose is optional, not required (2026-09-22)
Reversed course from the entry directly below, per explicit user
correction: real estate is one category Haven Rush events can serve, not
a requirement for every event to exist on the platform. The "required"
framing in that entry (and in the CLAUDE.md version it was built from)
no longer holds; a newer CLAUDE.md replaces it.

State at the time of correction: schema/admin/API work (the entry below)
was committed and pushed to `feature/event-purpose`, not merged, not yet
a PR. The site copy pass (home hero, event cards, `/agents`) hadn't
started, so there was no copy implying eligibility to undo, and design
tokens/colors were never touched (explicitly on hold, separate
rebrand conversation).

Changes made:
- `Event.purpose` is now `EventPurpose?` (nullable), not required.
- The migration (`20260922000000_add_event_purpose`) never shipped
  anywhere — not merged, not deployed — so it's edited in place to add
  the column as nullable, rather than layering a second "make it
  optional" migration on top of a required column nothing ever saw.
  Dropped the SALE backfill along with it: an optional column has
  nothing to backfill.
- Admin form: `required` removed from the purpose `<select>`; its blank
  option changed from a disabled placeholder ("Select a purpose…") to a
  real, submittable "Not specified" choice.
- `parseEventForm`/`createEvent`/`updateEvent`: purpose validation now
  only fires when a non-empty value was submitted; empty submits as
  `null`.
- Event detail page badge: now conditionally rendered (`event.purpose &&
  …`) since the value can be `null`.
- Seed data (`lib/seed-data.ts`) and its 5 assigned purposes were left
  as-is — the field itself being optional doesn't mean existing accurate
  values should be stripped; they're still useful, per the correction.

## Broaden positioning: Event.purpose (2026-09-22)
CLAUDE.md rewritten to broaden Haven Rush from "home discovery" to any real
estate space (sale, rental, lease, or showcase), with a stated real estate
purpose as the eligibility bar for every event — this entry covers the
schema/admin/API side of that (step 1); the site copy pass is a separate
step, reviewed before starting.

### `EventPurpose` is its own enum, not folded into `EventType`
`EventType` is the event's *format* (House Party, Home Hunt, Open House
Weekend, Home Fair); purpose is what it's marketing the property *for*
(sale, rental, lease, showcase). They're independent axes — a Home Hunt can
be sale-only homes or a mix of rentals and leases; a Home Fair showcases
model homes rather than selling that specific unit. Collapsing them into
one enum would force a combinatorial explosion of types or lose one axis.

### No admin-form default — forces an explicit choice
`EventForm`'s existing Type field silently defaults to the first option
(`EVENT_TYPE_ORDER[0]`) when creating a new event. Purpose deliberately
doesn't follow that pattern: CLAUDE.md's product rule frames this as
something "checked at listing/host onboarding, not just implied" — so the
select starts on a disabled blank option (`defaultValue=""`), and
`required` blocks submission until the host actually picks one. Editing an
existing event still pre-fills its current value as usual.

### Migration backfills existing rows to SALE, but the app never does
Adding a NOT NULL column needs every existing row to get a value before
the constraint can be applied. All of this project's rows to date (seed
data, and anything created via `/admin` before this ships) are home-for-
sale listings, so `SALE` is an accurate one-time backfill — but it's a
migration-only convenience, not an app default: the admin form has no
default (see above), and every seed event now states its purpose
explicitly (see below), so nothing in the running app relies on that
backfill after it runs once.

### Seed data purposes
Four of the five seeded events (South Congress Tasting Hunt, The
Elizabeth St Social, Austin Open House Weekend, Hyde Park Porch Hunt) are
straightforward home-for-sale listings with a brokerage and agent attached
— `SALE`. Sunday Market at Willow Creek (the Home Fair) is `SHOWCASE`
instead: its stops are a builder's model homes, which market the
community's available floor plans rather than being individually for sale
themselves — that's what CLAUDE.md's showcase example describes. No seed
event uses `RENTAL`/`LEASE` — nothing in the existing placeholder data
(all Austin single-family homes with sale-side brokerages) fits either
purpose, and fabricating a rental/lease example wasn't asked for.

### Stop keeps just `kind`, no per-stop purpose
CLAUDE.md's vocabulary section says a Home Hunt's stops "can mix for-sale
homes, rentals, and leasing units in one hunt," which could read as needing
per-stop purpose tracking. Decided against it: product rule #1 scopes the
required field to "recorded on the Event record" specifically, singular,
and describes it as *the* eligibility bar for the event, not per-property.
The "mixing" language describes real-world variety a host might walk
attendees through, not a schema requirement — nothing else in CLAUDE.md
(the admin form spec, the event detail badge, the API shape) asks for a
purpose per stop. Adding one now would be schema/UI scope beyond what was
asked, for a distinction (this stop is a rental, that one's a sale) that
has no consumer yet. If a future format genuinely needs it, `Stop` already
has `kind` as the place a per-stop attribute like this would go.

### `purpose` added to `/api/events` and `/api/events/[slug]`
Not explicitly requested, but both routes already expose `type` (the same
kind of event-level classification) — leaving the new required field out
of the public API while the admin form, seed data, and event detail page
all treat it as core would be an inconsistent contract. No new exposure
risk: `purpose` is exactly as public as `type` already is.

## Remove `/api/health/self-check` after a confirmed-good production check (2026-09-22)
Ran against the live deployment (by the user, since this sandbox still
can't reach `havenrush.com`): `{"ok":true,"events":{"count":5},
"scanTokenLookup":{"resolvedCorrectStop":true,"resolvedCorrectEvent":true},
"invalidScanTokenLookup":{"resolvedToNull":true}}` — all 5 seeded events
present, a real stop's scanToken resolves to the correct stop and event,
and an invalid token correctly resolves to `null`. Confirms Postgres is
reachable from the deployment and the scan/check-in data path works
end-to-end. Removed the route now that it's served its purpose — it was
explicitly temporary (see the entry below), not meant to stay as
permanent infrastructure.

## Temporary `/api/health/self-check` route (2026-09-22)
Added to verify the production deployment can reach Postgres and resolve a
real event/scanToken, since this sandbox's network egress policy blocks
fetching `havenrush.com` directly (see the previous entry) — running the
check server-side, inside the deployment, sidesteps that instead of
depending on egress being relaxed. Checks: total event count + slugs
(`listEvents()`), a real stop's scanToken resolving to the right stop and
event (`getStopByScanToken`), that stop count agrees between the two ways
it's computed (`countStopsForEvent` vs. the Prisma `include`), and that an
obviously-invalid token resolves to `null` rather than throwing.

Deliberately never echoes the scanToken it looks up — only booleans/counts
derived from the lookup — consistent with CLAUDE.md's "never expose a
scanToken in a JSON response" rule; the route reveals nothing `/api/events`
doesn't already. Rate-limited (5/min/IP, `lib/rate-limit.ts`) since it's
unauthenticated and does real DB work per request. This is intentionally
temporary — meant to be removed in a follow-up commit once a live check
against the deployment confirms everything works, not left as permanent
infrastructure.

## Merge PR #6, fix same-day date range, clean up build env vars (2026-09-22)

### Same-day date range showed "Oct 24–24"
`formatEventDateLabel` (`lib/events-db.ts`) decided same-day vs. range with
`event.startsAt.toDateString() === event.endsAt.toDateString()`, which
compares calendar dates in the server's local zone (UTC on Vercel), while
every formatted string below it uses `America/Chicago`. The seeded "South
Congress Tasting Hunt" runs 3–7pm CDT on Oct 24, which is 20:00–00:00 UTC —
same Central day, different UTC day — so `sameDay` came back `false` and
both ends of the range formatted to the same Chicago-zone day number.
Fixed by comparing zoned date keys (`Intl.DateTimeFormat("en-CA", {
timeZone, ... })`, which formats to `YYYY-MM-DD`) instead of the
UTC-vs.-local-ambiguous `toDateString()`. Single shared function, so the
fix covers the events feed, the event detail API response, and the admin
event list in one place. Verified against the actual UTC-crossing seed
event and against a genuine multi-day event (`Nov 7–8`, unaffected).

### `SEED_ON_BUILD` / `PRISMA_RESOLVE_ROLLED_BACK` no longer need to be set
Both were one-time setup/recovery knobs (initial seed, and clearing a
migration stuck as "failed" after a killed build) — the schema and seed
are stable now, so leaving them set just adds an unnecessary seed run (or
a no-op resolve attempt) to every deploy. Confirmed `scripts/vercel-build.sh`
reads both behind a guarded `if` (`[ -n "$PRISMA_RESOLVE_ROLLED_BACK" ]`,
`[ "$SEED_ON_BUILD" = "true" ]`), so removing them from Vercel's
environment variables changes nothing about how the script runs — it
just skips those blocks, same as it always did once they weren't set to
a truthy value. README's Vercel section rewritten to describe them as
one-time flags rather than something to leave configured permanently.

### PR #6 merge conflict was doc-only
PR #6 (admin tools) branched from the same commit PR #7 (QR check-in) did,
and both got merged into `main` in the same session — PR #6's merge
therefore conflicted with `main`, but only in `README.md` and
`DECISIONS.md` (each PR appended to both). No application code touched
the same file on both sides. Resolved by merging `origin/main` into
`feature/admin-tools` locally, combining both sides' additions (README:
kept both new route-table rows; DECISIONS: kept both new entries, in
sequence), rebuilding/relinting clean, then pushing and merging as normal
— no history rewritten, no `--force`.

### Production self-verification blocked by sandbox egress policy
Asked to check `havenrush.com` directly (admin login, `/s/[scanToken]`,
`/events`, `/api/events`) against the real deployment now that
`DATABASE_URL`/`DIRECT_URL` work in Vercel's build. This session's
network egress proxy returned a 403 on the CONNECT to `havenrush.com`
(organization policy, confirmed via `/__agentproxy/status` —
`recentRelayFailures` names the host, `connect_rejected`), not a
transient failure, so per the proxy's own guidance this wasn't retried
or routed around. Reported to the user as a blocker rather than skipped
silently or faked.

## Admin tools, steps 2-4: event form, stops, RSVPs (2026-09-22)

### Server Actions, not a parallel `/api/admin/*` REST layer
The brief asked for pages, not endpoints, and the public site's Server
Components already query Prisma directly (`lib/events-db.ts`,
`lib/passport-db.ts`) rather than calling this app's own `/api/*` routes
internally — the same reasoning applies here. `createEvent`/`updateEvent`
(`app/admin/(authenticated)/events/actions.ts`) and
`createStop`/`updateStop`/`deleteStop`/`moveStop`
(`.../events/[id]/stops/actions.ts`) are plain `"use server"` functions,
called directly from `<form action={...}>` or, for delete/reorder, from a
button's `onClick` — both are standard supported patterns, no extra
fetch/JSON round trip through this app's own server.

### Routes live inside `(authenticated)`, not sibling to it
Step 1 put the shell chrome in `app/admin/(authenticated)/layout.tsx` — a
route group only applies its layout to routes nested inside it, so
`/admin/events/new`, `.../[id]/edit`, `.../[id]/stops`, and `.../[id]/rsvps`
all had to live under `app/admin/(authenticated)/events/...` (not a
sibling `app/admin/events/...`) to inherit the header/logout shell. The
route group doesn't add a URL segment, so the URLs come out exactly as
specified regardless.

### Event form: `useActionState`, not a redirect+query-param error
Step 1's login form redirects back with `?error=1` on failure, which is
fine for a single password field with nothing to lose. The event form has
eight fields plus a repeatable reward-tiers list — losing all of that on
a full-page redirect would be a bad admin experience, so it uses React
19's `useActionState` instead: the action's return value becomes
component state without a navigation, so entered values stay put and an
inline error/success message renders next to the button. `createEvent`
redirects to the new event's edit page on success (`redirect()` inside a
`useActionState`-bound action is supported — the throw that drives the
navigation just means the state update never resolves, which is fine,
the component's about to unmount); `updateEvent` doesn't redirect, it
returns `{ success: true }` so "Saved." shows without leaving the page,
since from here you'd usually go on to Stops or RSVPs rather than back to
the list.

### Slug: client-side live preview, server-side is what actually decides
The title field updates the slug field live via a simple `slugify()`
(`lib/slugify.ts`) as long as the admin hasn't typed into the slug field
directly (tracked with a `slugTouched` flag — the same "stop
auto-generating once they've taken the wheel" pattern as any title→slug
form). That's a UX convenience only; `createEvent`/`updateEvent` re-
validate the submitted slug's format server-side (`SLUG_RE`) and check
uniqueness with a real query (excluding the event's own row on update)
regardless of what the client showed, since the client's opinion of
"free" could be stale.

### `datetime-local` inputs: round-tripped through America/Chicago, not the browser's/server's zone
An `<input type="datetime-local">` has no timezone of its own — it's just
"YYYY-MM-DDTHH:mm" as typed. Naively doing `new Date(value)` treats it as
the *server's* local time (UTC on Vercel), which would silently shift
every saved event by 5-6 hours from what the admin actually typed.
`lib/admin-datetime.ts` adds `toDateTimeLocalValue`/
`fromDateTimeLocalValue`, which explicitly target `America/Chicago` (the
same zone `lib/events-db.ts` already formats display dates in) via a
round-trip through `Intl.DateTimeFormat`: format a guessed UTC instant in
that zone, compare it to what was intended, and shift by the gap — this
gets the correct offset for that specific date (so it's correct across
the DST boundary) without a timezone library. Verified directly against
both a CDT (`-05:00`, October) and a CST (`-06:00`, December) seed
timestamp before wiring it into the form.

### Stop reordering: swap `order` with a neighbor, no drag-and-drop
"Reorder" is two buttons (▲/▼) per row that swap a stop's `order` with
the adjacent stop's, in a transaction (`moveStop`). No drag-and-drop
library, no fractional/sparse ordering scheme — simple, and the schema's
`Stop.order` is a plain `Int` with no gaps to manage.

### Stop `scanToken` is generated, never shown as an editable field
A new stop's `scanToken` is set server-side with `randomUUID()` (the same
approach `POST /api/rsvp` already uses for `Pass.token` — product rule 6:
unguessable, non-sequential). The admin form can't set or edit it; it's
only ever shown read-only in the stops table, since it's the physical-
QR-scan credential the whole passport mechanic depends on (see the
"scanToken is never returned by a JSON API" entry below) — letting an
admin retype it would risk them choosing something guessable.

### RSVP list rule-check: consent gates leads leaving the system, not the owner viewing their own data
CLAUDE.md's consent rule (product rule 1) and the "must not expose
anything I wouldn't already have permission to see" instruction are about
data leaving Haven Rush's system to a third party (an agent). The
business owner viewing their own attendees' email/intent/timeline/consent
/stamp count in their own admin panel isn't a third-party disclosure —
it's the data controller looking at data they already control, and
that's the explicit point of this page ("the sponsor-facing number I'll
want to show"). No masking applied.

### A real bug caught building this: same-specificity Tailwind width classes don't compose by string order
Built the reward-tier row as `` `${inputClass} w-24` `` (a fixed-width
"stops" field) and `` `${inputClass} flex-1` `` (a fill-width "reward"
field), where the shared `inputClass` already included `w-full`. Screen-
shotting the form showed the "reward" input collapsed to ~30px instead of
filling the row. Traced it with computed styles: `flex-grow`/`flex-basis`
were correctly `1`/`0%`, but the *other* field (`w-24`) was rendering at
~556px, meaning its `w-full` (from `inputClass`) was winning over `w-24`
appended after it in the className string. Same-specificity Tailwind
utility classes resolve by their order in the *generated stylesheet*, not
by their order in a component's className string — appending a narrower
width class after a `w-full` base doesn't reliably override it. Fixed by
splitting the shared style into a width-less `fieldBaseClass` and adding
each field's own width explicitly (`w-full`, `w-24`, or `flex-1`), so no
two width utilities ever compete on the same element. Re-verified with
computed `getBoundingClientRect()` widths after the fix (96px / fills
remaining space, as intended) and a screenshot. This pattern
(`${inputClass} <width-utility>`) doesn't recur elsewhere in these admin
components — grepped for it.

### What's still unverified: everything that needs a real event row
`/admin` (event list), `/admin/events/[id]/edit|stops|rsvps` all
require a real `Event.id` from Postgres to render past `notFound()` —
this sandbox still has no `DATABASE_URL`/`DIRECT_URL`. Verified instead,
against a locally generated test password, everything that *doesn't*
need a DB row: the full login round trip (from step 1, still holds), and
`/admin/events/new`'s form itself — slug auto-generation, the
title→slug "touched" cutover, adding/filling reward-tier rows, and (after
the fix above) their layout — rendered and interacted with via Playwright,
screenshotted before and after the width fix.

## Admin tools, step 1: auth + shell + event list (2026-09-22)

### Password auth: scrypt + a signed cookie, no library
Single shared password (no user accounts), per instruction. Hashed with
Node's built-in `scrypt` (`lib/admin-auth.ts`), stored as `salt:hash` hex
in `ADMIN_PASSWORD_HASH` — no new dependency (avoids bcrypt's native
bindings, which can be friction on serverless). The session is a cookie
holding `base64url(JSON{exp}).HMAC-SHA256(that, SESSION_SECRET)` — no
session table, no JWT library. `isValidSessionCookieValue` checks the
signature with `timingSafeEqual` before ever parsing the payload.
`scripts/hash-admin-password.ts` is the "one-time script" asked for; it
reads the password from stdin (supports both an interactive masked
prompt and `echo -n pw | npm run admin:hash-password`), never from a CLI
arg, so it doesn't land in shell history.

### `middleware.ts` doesn't exist in this Next.js version — it's `proxy.ts`
Built it as `middleware.ts` first, matching the file name every Next.js
doc and tutorial in training data uses. `npm run build` warned it's
deprecated in favor of `proxy.ts` (renamed in this project's Next.js
16.3.5). Also different in a way that mattered here: the doc bundled in
`node_modules/next/dist/docs` says *"Proxy defaults to using the Node.js
runtime. The `runtime` config option is not available in Proxy files.
Setting the `runtime` config option in Proxy will throw an error."*
The old middleware convention defaulted to the Edge runtime, which
doesn't have `node:crypto` (needed for the scrypt/HMAC session check),
so the plan had been to force `export const runtime = "nodejs"` — under
the new `proxy.ts` convention that line would have broken the build
outright, and turned out to be unnecessary anyway, since Proxy always
runs on Node.js now. Renamed the file, the exported function
(`proxy`, not `middleware`), and dropped that line entirely.

### Route structure: `app/admin/login` outside auth, `app/admin/(authenticated)` inside it
`proxy.ts` gates everything under `/admin/*` except `/admin/login`
(matched by exact pathname before the cookie check). The shell chrome
(header, "View site" link, log out button) lives in
`app/admin/(authenticated)/layout.tsx`, a route group that doesn't affect
the URL — `/admin` still resolves to
`app/admin/(authenticated)/page.tsx` — so the shell only wraps pages a
valid session can already reach; the login page never renders it. No
`app/admin/layout.tsx` was needed for shared chrome: `/admin/*` sits
outside the `(site)` route group already, so it inherits none of the
public `SiteHeader`/`SiteFooter` from the root layout for free.

### Verified the auth flow directly (not the event list — no DB here)
Ran the full flow with Playwright against a locally-generated test
password/hash: unauthenticated `/admin` → redirect to
`/admin/login?next=%2Fadmin`; wrong password → `?error=1`, no cookie
set; correct password → redirected to the original `next` target with a
`httpOnly`/`sameSite=Lax` cookie set. Confirmed via the server-side
error message itself that the authenticated request truly reached
`/admin`'s page code (it failed on the expected
`Environment variable not found: DATABASE_URL`, from
`listEventsForAdmin()`'s Prisma call) rather than being silently
redirected back — i.e., the auth gate passed a real request through, it
just has nowhere to query in this sandbox. The event list's actual
rendering (and the rest of steps 2-4) still can't be visually verified
here until `DATABASE_URL`/`DIRECT_URL` are reachable.

## QR check-in, steps 3-4: email fallback, RSVP-time persistence, PR (2026-09-22)

### Storage key changed from event id to event slug
The entry below describes keying `lib/pass-storage.ts` by `eventId`. That
changed here: adding RSVP-time persistence to `components/rsvp-flow.tsx`
needs *some* event identifier, and that component only has `eventSlug`
as a prop — `POST /api/rsvp`'s response is just `{ token }`, no event id,
and widening that response only to serve this felt like the wrong fix
next to just using the identifier already at hand. The passport and scan
pages both already load the event's `slug` alongside its `id` (it's a
plain scalar field pulled in by their existing `include`/`select`), so
switching the storage key to `slug` everywhere cost nothing there and
meant `POST /api/rsvp`'s contract didn't need to change at all — same
reasoning as leaving `POST /api/stamps/scan` alone for the stamp count in
the step 1-2 entry below. `Event.slug` is `@unique`, so it's exactly as
safe a key as `id` was.

### RSVP-time persistence: same store, same key, written from a second call site
`components/rsvp-flow.tsx` now calls `storePassToken(eventSlug,
data.token)` the moment `POST /api/rsvp` succeeds, right alongside the
existing `setPassToken`/`setStep(2)` — before the attendee ever sees the
"View Mobile Passport" link, let alone clicks it. This is the same
function the passport page's `PersistPassToken` calls; between the two,
a token lands in storage whichever of "RSVP, then close the tab" or
"RSVP, then actually open the passport" happens, without either call
site needing to know about the other.

### Email fallback: reuses `stampWithToken`, so it "completes the stamp the same way" for real
Pulled the scan-and-classify logic out of the auto-check effect into a
standalone `stampWithToken(passToken, scanToken)` so the email-lookup
form's submit handler and the effect call the literal same function,
rather than two copies of the same response-handling `if`-chain drifting
apart over time. On a successful lookup, `storePassToken` runs before
the stamp attempt — same store, same key as the other two write sites —
so the next stop at the same event skips the form entirely.

### New endpoint: `POST /api/passport/lookup`, rate-limited per IP
Needed *some* server endpoint for "event + email -> pass token" that
didn't exist yet. Modeled on `POST /api/stamps/scan`'s shape (typed body
parsing, a 429 with `Retry-After` on rate limit, `{ error }` on failure)
but limited per-IP only, with no secondary key — `POST /api/stamps/scan`
partly limits per-`passToken` too, but there's no equivalent second
dimension to key on here (an attacker gets to pick the email freely).
This is deliberately an email-guessing surface — enter an event slug and
an email, get back a working pass token if that attendee RSVP'd — which
is the explicit ask ("falls back to looking up the pass by event +
email"). The rate limit is a real but partial mitigation, not a claim
that this is a hardened endpoint; noting it plainly rather than either
skipping the limit or overbuilding something more elaborate than asked
for.

### Verification, again blocked on a live database — tried to confirm that's still true before assuming it
Re-checked `DATABASE_URL`/`DIRECT_URL` in this sandbox before writing
this off again (length-only, never printed) — still unset. Every state
of `/s/[scanToken]` runs a Prisma query before it can render anything,
`POST /api/passport/lookup` is a new DB-backed endpoint with no page of
its own to inspect, and `components/rsvp-flow.tsx` only mounts on the
DB-backed `/events/[slug]` page — so nothing this pass touches is
reachable without one, unlike the admin-tools work where at least one
page rendered DB-free. Verified `npm run build` and `npm run lint` clean,
and grepped for any leftover `eventId` reference across the touched
files after the slug rename (none).

## QR check-in, steps 1-2: pass persistence + /s/[scanToken] (2026-09-22)

### localStorage, keyed by event id — not a single global slot, not a cookie
`lib/pass-storage.ts` stores `{ [eventId]: passToken }`, not one bare
token. An attendee can hold passes for more than one Haven Rush event (a
Home Hunt this month, an Open House Weekend next month); a single global
"current pass" slot would let RSVP'ing to the second silently overwrite
the first, so returning to a stop from the first event would then either
fail to find a pass or — worse — try to stamp the wrong one. Keying by
event id keeps both valid at once and is what makes the "wrong event"
state (below) reachable through the normal flow rather than only via the
step-3 email path: it fires when the device holds a pass, just not one
for *this* stop's event.

Chose localStorage over a cookie because nothing here needs the token
sent automatically on every request to this origin (unlike the admin
session cookie) — it's read once, client-side, and sent explicitly in
the `POST /api/stamps/scan` body. `getStoredPassToken`/`storePassToken`
no-op under SSR (`typeof window === "undefined"`) and swallow
`localStorage` errors (private browsing, quota) — persistence here is a
convenience the flow already has a fallback for (step 3's email lookup),
not something to let crash the page.

### Persisted only on the passport page, per instruction — not also at RSVP
The brief scoped step 1 to "on the passport page," and that's what's
built (`components/persist-pass-token.tsx`, a no-op-render client
component mounted in `app/passport/[token]/page.tsx`). Worth flagging
explicitly since a more defensive design would *also* persist right when
`POST /api/rsvp` returns a token in `components/rsvp-flow.tsx`, before
the attendee necessarily clicks through to the passport page at all —
if they close the confirmation screen without visiting `/passport/...`,
this device won't have their token until they do. Didn't add that here
since it's out of the scope given; flagging in case the answer is
"actually, yes, both."

### `/s/[scanToken]` never receives the scanToken as a data prop
The server page (`app/s/[scanToken]/page.tsx`) reads `scanToken` from
`params` to query the stop, but the client component it renders
(`components/scan-checkin.tsx`) is never handed that value as a prop —
it reads it straight back out of the URL via `useParams()`. Both ends
independently read the same URL the attendee is already on; the value
never gets serialized into page data or a JSON response on its way
between them. This satisfies CLAUDE.md's "never expose a stop's
scanToken in any JSON API response... the page itself is the only place
it's read, server-side, from the URL param" — read server-side to
*validate*, and separately by the client straight from the address bar
to *submit*, but never round-tripped through my own code as a value in
between.

### "Live" = strictly between `startsAt` and `endsAt`, no grace window
`lib/scan-db.ts#isEventLive` is a plain `now >= startsAt && now <=
endsAt`. No early-open or late-close grace period — not asked for, and
adding one would be a guess at a number nobody specified. Easy to add a
window later if hosts want to let people check in 30 minutes early.

### Total-stops count comes from the page's own query, not from `POST /api/stamps/scan`'s response
The scan API returns `stampedCount` but not a total, and the success
screen needs to show "4 of 10." Rather than change the already-shipped,
tested scan endpoint's response shape, `app/s/[scanToken]/page.tsx`
queries `countStopsForEvent` itself (one extra `prisma.stop.count`,
already knows the event id from resolving the stop) and passes it down
as a prop. Keeps the scan API's contract exactly as it was.

### The "no local pass" state is an honest dead end, not a fake form
Step 3 (email fallback) is explicitly the next piece, not this one. When
`getStoredPassToken` comes up empty, `ScanCheckIn` shows a plain message
("we don't see a pass for this event on this device...") rather than a
form that doesn't do anything yet, or worse, a form that silently no-ops
on submit. It also covers the case where the API returns 404 on the
pass (a stored token pointing at a pass that's since been deleted) —
same state, since from the attendee's side it's the same problem:
"nothing usable is stored here."

### Verification: build/lint clean; couldn't render any state without a DB
Every branch of `/s/[scanToken]` — including the "invalid code" error —
runs at least one Prisma query before it can decide what to show, so
none of it is reachable without `DATABASE_URL`/`DIRECT_URL`, unlike
earlier admin-tools pieces where at least one page rendered DB-free.
Verified what's checkable without one: `npm run build` and `npm run
lint` clean, and read back through the scan API's existing route
handler line by line to make sure `ScanCheckIn`'s response handling
(the `"doesn't belong"` substring match for wrong-event, the 404/`
alreadyStamped`/`stampedCount` shape) actually matches what it returns
today rather than an assumption about it.

## Strip a dotenv log line that had leaked into migration.sql (2026-09-21)
The P3009 failure in the previous entry turned out to have a second layer:
once `PRISMA_RESOLVE_ROLLED_BACK` cleared the stuck failed-migration
record, Vercel's retry of `prisma migrate deploy` failed again, this time
with a Postgres syntax error at `◇ injected env (0) from .env` on line 1
of `20260920221259_init/migration.sql`. That line (plus a
`Loaded Prisma config from prisma.config.ts.` line and a blank line right
after it) isn't SQL at all — it's `dotenv`'s own console log line from
`prisma.config.ts`'s `import "dotenv/config"`, which must have been
captured into the file back when this migration was originally generated
with its output redirected into `migration.sql` (e.g.
`prisma migrate dev > migration.sql` or similar, rather than letting
Prisma write the file itself). Checked all 4 migration files
(`grep` for that line and other dotenv/Prisma banner text anywhere in
them, not just line 1) — only `20260920221259_init/migration.sql` had it,
right at the top.

None of the 4 migrations has ever successfully applied to any database
(this is the project's first real deploy attempt, still failing before
this fix), so editing a shipped migration file — normally off-limits once
applied — was safe here: removed the 3 junk lines, leaving line 1 as
`-- CreateSchema`, the file's original first real line.

To stop it recurring, `prisma.config.ts` now calls `dotenv`'s `config()`
directly with `{ quiet: true }` instead of the side-effect
`import "dotenv/config"`, which suppresses the "injected env" log line at
the source — verified with `npx prisma generate`, which no longer prints
it. This only prevents the log line from being generated in the first
place; it doesn't change how migrations are written (that's on whoever
runs `prisma migrate dev` next to not redirect its console output into
the SQL file). Grepped the whole repo for other `dotenv` entry points —
`prisma.config.ts` is the only one, so there's nowhere else this could
leak from.

## Recover from a failed migration on Vercel without a terminal (2026-09-21)
First real Vercel deploy against the (new, empty) Supabase database hit
`prisma migrate deploy` failing with **P3009**: an earlier, interrupted
build had left migration `20260920221259_init` recorded in Postgres's
`_prisma_migrations` table as failed, and every subsequent `migrate
deploy` refuses to proceed past a failed migration rather than risk
re-applying something partially done. Since the database is new and
empty, there's nothing to actually roll back — the fix is just telling
Prisma to forget the failed attempt so `migrate deploy` retries it fresh.
Normally that's `prisma migrate resolve --rolled-back <name>` run once by
hand, but the user has no terminal access to this Vercel project, so it
needed to be buildable from an env var instead:

`scripts/vercel-build.sh` now runs
`prisma migrate resolve --rolled-back "$PRISMA_RESOLVE_ROLLED_BACK"`
before `migrate deploy`, only when that env var is set, with `|| echo
...` (not bare, so `set -e` doesn't treat it as fatal) around it so a
"nothing to resolve" result — the normal case once the one bad migration
is cleared — never fails the build. `migrate deploy` itself runs
undecorated (no output capture/piping) so a real failure's full Prisma
error text reaches the Vercel build log verbatim. Verified all three
paths (no env var set / resolve has nothing to do / deploy genuinely
fails) with a stubbed `prisma` binary before pushing, since this sandbox
still has no real Supabase connection to test against directly.

Value to set in Vercel: `PRISMA_RESOLVE_ROLLED_BACK=20260920221259_init`
(the exact migration name from the P3009 error). Safe to leave set
permanently — once resolved, later runs just hit the harmless "nothing to
resolve" branch — but fine to remove again once a build succeeds, since
its only job is clearing this one incident.

## Backend build: API routes, DB wiring, Vercel migrate/seed (2026-09-21)

### Step 1 (DB) blocked, then descoped for this pass
`DATABASE_URL`/`DIRECT_URL` are not set in this sandbox at all (not just
empty — absent from the environment and no `.env` file exists). Confirmed
by running `prisma migrate deploy` directly: it fails before touching the
network, at schema validation —

```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Environment variable not found: DIRECT_URL.
```

Per instruction, `migrate deploy` and `db seed` were not run here. Row
Level Security was already handled in an earlier commit on this branch
(migration `20260920221304_enable_row_level_security`, all 9 tables, no
policies) — nothing new was needed for that part once a real DB connects.
Given the CLI here has no path to Supabase, the user asked to proceed with
the API/wiring work regardless and to make migrations + seeding runnable
from Vercel instead, where the real env vars live. See README (once
updated) / the PR description for the exact Vercel setup steps.

### `lib/prisma.ts`
Standard Next.js singleton (`globalThis`-cached `PrismaClient`), so dev's
module hot-reloading doesn't open a new connection pool per edit.

### Query helpers instead of routes calling routes
Server Components (`/events`, `/events/[slug]`, `/passport/[token]`) query
Prisma directly through shared helpers in `lib/events-db.ts` and
`lib/passport-db.ts`, rather than `fetch`-ing this app's own API routes —
the routes exist because the brief asked for them (and they're useful for
any future non-Next client), but a server component calling its own HTTP
API over the network would be a pointless round trip. Both the pages and
the route handlers import the same helpers, so the query and
derived-field logic (`homesCount`, `hostingBrokerages`, reward-tier
parsing, date-label formatting) isn't duplicated.

### `scanToken` is never returned by a JSON API
`GET /api/events/[slug]` lists an event's stops but omits each stop's
`scanToken`, and `GET /api/passport/[token]` only exposes a `stamped`
boolean per stop, never the token. A stop's `scanToken` is the credential
that stamps it — the whole scavenger-hunt mechanic depends on it only
being reachable by physically scanning the QR code at that stop. Putting
it in a public JSON response would let anyone stamp any pass for any stop
remotely, with no visit required. (The `/s/[scanToken]` QR landing page
that actually consumes it is still Phase 3/4, per the existing Phase 1
entry below.)

### RSVP → consent-gated lead forwarding
`POST /api/rsvp` upserts the Attendee (by email) and the Pass (unique on
`attendeeId`+`eventId`, so re-RSVPing to the same event updates the
existing pass instead of erroring or duplicating), storing
`agentContactConsent`, `consentedAt` (`null` unless consent is `true`),
and the exact `consentText` shown (`lib/site-config.ts`'s `CONSENT_TEXT`)
— per product rule 1. `LeadDelivery` rows (one per unique agent behind the
event's `LISTING` stops) are created **only** when
`agentContactConsent === true`; with no consent, zero `LeadDelivery` rows
exist for that pass, so there is nothing for any future dispatcher to
send. Actually delivering a lead (calling an `Agent.crmWebhookUrl`) is out
of scope here — this pass only creates the `PENDING` record consent
gates.

Pass tokens use `crypto.randomUUID()` (product rule 6: unguessable,
non-sequential).

### `POST /api/stamps/scan`: idempotent + rate-limited
Idempotent via a `findUnique` check before create on the
`passId_stopId` unique constraint (returns `alreadyStamped: true` instead
of erroring on a repeat scan), with a create-then-catch-P2002 fallback for
the race where two requests hit at once. Rate limiting
(`lib/rate-limit.ts`) is an in-memory fixed window keyed on
`ip:passToken`, which is a real limitation: it's per-instance and resets
on cold start, so it won't hold a limit across multiple concurrent Vercel
instances. Flagging this rather than pretending it's production-grade —
swapping in a shared store (e.g. Upstash Redis) is the fix if this needs
to be tight at scale.

### `Event.state` isn't a DB column
`lib/seed-data.ts`'s `SeedEvent` shape carries a `state` field (all `"TX"`
placeholder data), but the Prisma `Event` model never had one — only
`neighborhood`/`city`. Rather than add a column for this pass, the event
detail page's location line was changed from `{neighborhood} · {city},
{state}` to `{neighborhood} · {city}`. Flagging in case `state` should
become a real column later (e.g. once markets outside Texas exist).

### Pages need `export const dynamic = "force-dynamic"`
This Next.js version's default caching model (Cache Components is opt-in
via `cacheComponents: true` in `next.config.ts`, not set here) will still
attempt to statically prerender a page at build time unless told
otherwise, even one that's just an async Server Component doing a Prisma
call with no `fetch`. Without `DATABASE_URL`, that prerender attempt would
throw during `next build`. `/events`, `/events/[slug]`, and
`/passport/[token]` (all DB-backed, all meant to be fresh per request
anyway — no login, live stamp/RSVP data) now export
`dynamic = "force-dynamic"`, and `/events/[slug]`'s old
`generateStaticParams` (which read `lib/seed-data.ts`) was removed.
Verified by running `npm run build` in this sandbox with no
`DATABASE_URL`/`DIRECT_URL` set at all — it completes, and the route
summary correctly marks those three plus all `/api/*` routes as `ƒ`
(server-rendered on demand) rather than trying to prerender them. `/` and
`/agents` stay static since neither touches the DB.

### Vercel: migrations + build-time seed (superseded, see below)
Added a `vercel-build` script running `prisma generate && prisma migrate
deploy && next build`, alongside the existing `build` script (unchanged,
so local/CI builds without DB credentials still work — verified above),
plus a `POST /api/admin/seed` endpoint (secret-gated via `SEED_SECRET`)
as a way to trigger the already-idempotent `prisma/seed-runner.ts` once
Vercel had real DB credentials. Replaced by the simpler build-time-flag
approach below at the user's request, since they can't run terminal
commands (e.g. `curl`) to hit an endpoint after deploy.

### Simplified: `SEED_ON_BUILD` flag instead of an admin endpoint (2026-09-21)
Removed `POST /api/admin/seed` and `SEED_SECRET` entirely — no endpoint,
no secret to manage. `vercel-build` is now `sh scripts/vercel-build.sh`,
which runs `prisma generate`, `prisma migrate deploy`, then `npm run
db:seed` **only** when the `SEED_ON_BUILD` env var is exactly the string
`"true"`, then `next build`. `prisma/seed-runner.ts` was already built
entirely out of upserts (or an existence check before create), keyed on
each table's natural unique field, so it's safe to leave
`SEED_ON_BUILD=true` set permanently in Vercel — every build re-applies
the same placeholder rows rather than duplicating them, and non-placeholder
rows (real attendees, real stamps) are untouched since the seed only ever
touches the fixed set of keys in `lib/seed-data.ts`. A shell script (vs.
inlining the conditional in `package.json`) so the seed step's own
failure still fails the build (`set -e`), rather than a one-liner's
`||`-based skip-logic accidentally swallowing a real seed error along
with the "flag not set" case.

## CLAUDE.md replaced verbatim; Home Fair copy/seed corrected (2026-09-21)
The user supplied an updated CLAUDE.md and asked that the repo's copy be
replaced with it exactly. Beyond the Vocabulary section (expected — it's
what prompted the update), the Stack section also changed: it now spells
out `NEXT_PUBLIC_SITE_URL` for building absolute URLs (QR codes encode
`${SITE_URL}/s/[scanToken]`), clarifies Cloudflare is DNS/redirects only
(no Workers/D1), and names the Supabase project (`haven-rush`). Everything
else (Files, Design tokens, Product rules, Placeholder data, Working
style) was byte-identical. `NEXT_PUBLIC_SITE_URL` isn't wired up yet since
the `/s/[scanToken]` scan flow doesn't exist yet (Phase 3/4) — flagging so
it isn't missed when that's built.

Corrected two things from the previous entry below to match the new
CLAUDE.md's exact wording:
- Home Fair's home-page card copy is now the literal string from CLAUDE.md
  ("A builder's new neighborhood, opened up like a market. Tour model
  homes, meet local makers, and collect stamps."), replacing the
  looser paraphrase used before.
- The placeholder Home Fair seed event is no longer "Mueller New Home
  Market" (a real, established Austin neighborhood) — it's now "Sunday
  Market at Willow Creek" (`sunday-market-at-willow-creek`), matching
  CLAUDE.md's suggested placeholder exactly. Willow Creek is a fictional
  new-construction community, which fits the corrected Home Fair concept
  (a builder opening a *new* neighborhood like a market day) better than
  reusing a real, already-established one. Broadened its stops beyond
  model homes + coffee/food to include the lender/designer/mover booths
  and live-music stage CLAUDE.md now describes as part of the format,
  using VENDOR/MUSIC stop kinds already in the schema (no schema change
  needed).

No migration change was needed for this pass: migration
`20260921120000_rename_home_crawl_add_home_fair` (added in the previous
entry) was already a new, additive migration — it doesn't edit any
previously shipped migration file, and it already does exactly what's
required here (rename `HOME_CRAWL`→`HOME_HUNT` in place, add `HOME_FAIR`
back, no existing rows touched).

## Event types: Home Crawl renamed to Home Hunt, Home Fair restored (2026-09-21)
Per explicit instruction, renamed `HOME_CRAWL` to `HOME_HUNT` everywhere
(enum, `lib/event-types.ts`, seed data ids/slugs/titles, UI copy — "Find a
Hunt", "Upcoming hunts", "South Congress Tasting Hunt", "Hyde Park Porch
Hunt") and restored `HOME_FAIR` as a fourth event type with new
builder-hosted-market copy, reversing the previous decision below to retire
it. There are now four event types: House Party, Home Hunt, Open House
Weekend, Home Fair.

The home page shows House Party / Home Hunt / Open House Weekend as the
three equal-sized main cards, with a smaller "For builders" card for Home
Fair below them (per instruction). `/agents` now has a package card for
all four types.

Added a placeholder Home Fair seed event, "Mueller New Home Market"
(Mueller is a real Austin master-planned community known for new
construction — fits the "builder-hosted market" framing), with five
LISTING-only stops representing builder model homes plus a coffee cart and
a food-truck stop. Its LISTING stops use `brokerage`/`agentName` loosely to
mean "builder name" / "on-site sales team" rather than a licensed
third-party brokerage — the Stop model has no separate "builder" concept,
and adding one felt like scope creep for placeholder data; flagging this
as a modeling shorthand rather than a schema change.

Migration `20260921120000_rename_home_crawl_add_home_fair` renames the
`HOME_CRAWL` enum value in place (Postgres supports `ALTER TYPE ... RENAME
VALUE`, a metadata-only change — existing rows read as the new label with
no data migration needed) and adds `HOME_FAIR` back with `ALTER TYPE ...
ADD VALUE` (natively supported, unlike removal). The migration doesn't use
the new value anywhere in the same file, since Postgres disallows using a
freshly added enum value within the transaction that added it.

## Event type: Home Fair retired, replaced by Open House Weekend (2026-09-20)
Per explicit instruction, removed `HOME_FAIR` everywhere (home page card,
events feed, seed data, `/agents`, the `EventType` enum) and replaced its
slot with `OPEN_HOUSE_WEEKEND`, which already existed in the enum/vocabulary
as a docs-only type. The seeded "Austin Housing Fair" event became "Austin
Open House Weekend · Nov 7–8 · Citywide", with its stops changed from
VENDOR/COFFEE booths to five LISTING-only stops spread across neighborhoods
(South Congress, Bouldin Creek, Hyde Park, Zilker, Travis Heights), each
with a brokerage/agent — two of those brokerages (Zilker Realty Group,
Travis Heights Realty) are new placeholder seed data introduced for this
event. Its event-level sponsors (Lonestar Lending, Capital Title) were kept
as-is since Sponsor is a separate concept from passport stops.

Since the enum already had a Prisma migration applied in principle (Phase 2
shipped `20260920221259_init`), removing `HOME_FAIR` from a live enum isn't
a simple column edit — Postgres has no `DROP VALUE` for enums. Added migration
`20260921000000_remove_home_fair_event_type`, which moves any existing
`HOME_FAIR` rows to `OPEN_HOUSE_WEEKEND` first, then swaps the column to a
freshly created enum without the retired value (rename-old/create-new/cast/drop-old
pattern) rather than editing the already-shipped migration files.

## Stack: Supabase Postgres for dev and prod (2026-09-20)
Originally CLAUDE.md called for SQLite in local dev and Postgres in production.
Per explicit instruction, we switched to Postgres via Supabase for **both**
environments — no SQLite. Prisma's `datasource db` uses two env vars:
- `DATABASE_URL` — Supabase's transaction pooler (port 6543, `pgbouncer=true`).
  Used by the app at runtime (Prisma Client).
- `DIRECT_URL` — Supabase's direct connection (port 5432, no pooler). Used only
  by Prisma Migrate, which needs session-level Postgres features the
  transaction pooler doesn't support.

Row Level Security is enabled (no policies) on every table in a dedicated
migration, so Supabase's auto-generated PostgREST/GraphQL API cannot read or
write any table. The app talks to Postgres directly through Prisma using the
`postgres` role, which has `BYPASSRLS` on Supabase projects by default, so
this doesn't affect the app itself — it only locks the tables away from the
REST API surface, which we don't use.

Hosting target is Vercel, so no Cloudflare-specific adapters (e.g. no
`@cloudflare/next-on-pages`, no D1/KV bindings).

This repo has no live Supabase project or network access to one, so
`prisma migrate dev`/`db seed` haven't been run here — see README for the
setup steps to run against a real project.

## Phase 1 scaffold
- Reorganized the three brief-referenced docs (`Haven_Rush_App_v2_dc.html`,
  `brand-guidelines.md`, `business-plan.md`) from the repo root into `docs/`
  and `docs/mockup/` to match the paths CLAUDE.md already references.
- The mockup's top nav is a demo view-switcher (Home / Event Example / Mobile
  Passport / For Agents & Hosts), not a real site's navigation — a visitor
  doesn't navigate to "a random event" or "the mobile passport" from a global
  nav. Real nav is Home (logo) / Events / For Agents & Hosts, plus a
  "Find a Crawl" CTA linking to `/events`.
- Fixed per the brief: every event in `/events` links to its own
  `/events/[slug]`, and the passport's stamp count / reward progress is
  computed from stamp + reward-tier data rather than hardcoded.
- Event detail pages also show the hosting brokerage name(s), derived from
  LISTING stops, per product rule #2 (attribution) — not present in the
  mockup's detail view, but required by CLAUDE.md.
- `/s/[scanToken]` (QR scan landing) is not built yet — it lands with the
  scan flow in Phase 3/4. The passport's "Scan QR" affordance is a static
  label for now, not a dead link.
- The RSVP flow on the event detail page is visual/local-state only in
  Phase 1 (matches the mockup's 3-step flow: Get Pass → preferences →
  confirmation). Phase 4 wires "Continue" to `POST /api/rsvp` and adds the
  email + consent fields the spec calls for; the confirmation step links to
  a seeded demo pass until then.
