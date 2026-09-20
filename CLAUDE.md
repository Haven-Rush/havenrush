# Haven Rush — project brief for Claude Code

Read this first, then `/docs`. Where this file and a docs file disagree, this file wins.

## What we're building
Haven Rush is an event marketing platform that turns home discovery into neighborhood social events (coffee, live music, local food, a stamp-collecting "passport"). Attendees get in free. Licensed agents, brokerages, and local sponsors pay for participation and permission-based leads.

**Haven Rush is not a brokerage.** It never represents buyers or sellers. Licensed partner agents do that.

## Files
- `docs/mockup/Haven_Rush_App_v2_dc.html` — visual + interaction reference (5 views). **Not a codebase**: it is a design-tool export (`x-dc` format, inline styles, `useState`-style view switching) that also expects `support.js` and `ios-frame.jsx`. Rebuild it; don't try to run or extend it.
- `docs/brand-guidelines.md` — voice, colors, type, signage, compliance notes.
- `docs/business-plan.md` — products, customers, revenue model, launch plan.

## Stack (decided)
Next.js (App Router) + TypeScript + Tailwind CSS + Prisma. Postgres via Supabase for both local dev and production (no SQLite) — `DATABASE_URL` is the pooled connection (port 6543, used at runtime) and `DIRECT_URL` is the direct connection (used by Prisma Migrate). Hosted on Vercel — no Cloudflare-specific adapters. Real URLs replace the mockup's view switching.

| Mockup view | Route |
|---|---|
| Home | `/` |
| Events feed | `/events` |
| Event detail + RSVP | `/events/[slug]` |
| Mobile passport | `/passport/[token]` |
| For Agents & Hosts | `/agents` |
| QR scan landing | `/s/[scanToken]` |

## Design tokens (Tailwind theme)
- sage `#2E5A44` (primary), honey `#F2A93B` (accent), charcoal `#1F2421` (text), linen `#F9F8F3` (page background, never pure white for the page)
- honey-text `#C07F1E` — the darker honey the mockup uses for small uppercase labels (contrast)
- Headlines: Domine (serif). Body/UI: Plus Jakarta Sans. (Brand doc names Recoleta/Ogg as ideals; Domine is the free stand-in the mockup uses.)
- Voice: warm, neighborhood-proud, never salesy, no real-estate jargon. B2B pages are clear and ROI-focused.

## Vocabulary (canonical)
Event types: **House Party**, **Home Hunt**, **Open House Weekend**, and **Home Fair** (builder-hosted market). The mockup UI originally said "Home Crawl"; we now use the brand doc's "Home Hunt" label everywhere (see DECISIONS.md). On the home page, House Party / Home Hunt / Open House Weekend get equal-sized main cards; Home Fair gets a smaller "For builders" card. Keep the enum in one place (`lib/event-types.ts`) so a rename is a one-line change.

## Product rules that must hold
1. **Consent before any lead leaves the system.** Sharing an attendee's details with an agent happens only if they ticked an explicit, unchecked-by-default consent box at RSVP. Store the consent flag, timestamp, and the exact consent text shown.
2. **Attribution.** Any listing stop or event page shows the hosting licensed brokerage's name. Footer and `/agents` carry: "Haven Rush is an event marketing platform. Real estate services are provided by independent licensed partner agents."
3. **RESPA / fair market value.** `/agents` and any sponsor-facing copy needs a short disclaimer that pricing reflects fair market value for advertising exposure. Use placeholder text and mark it `TODO(legal)`.
4. **Utah review pending.** The business plan says advertising, referral, compensation and lead-gen rules need Utah review before launch. Don't hardcode legal claims; keep disclaimer copy in one editable file.
5. **No unsourced statistics on public pages.** The brand doc quotes lead-cost and NAR figures (cost per lead, "78% work with first agent"). Don't publish them until sourced.
6. Passport and pass URLs use unguessable tokens (no sequential IDs). No login for attendees.

## Placeholder data
The mockup's events are set in Austin, TX (South Congress, Bouldin Creek, Hyde Park). Treat as placeholder seed data; make city/neighborhood plain data, not hardcoded UI.

## Working style
Build in phases; after each, run it, summarize what works, and stop for review before the next. Prefer small, tested pieces. Note anything you assumed in `DECISIONS.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
