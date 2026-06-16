# NudGoo 🤙

> **Plans, polls & group chaos — sorted.** A mobile-first PWA for a friend
> group ("the gang") to chat, plan trips, vote on dates, split bills, run
> quick games, and climb the leaderboard.

This is a **pixel-perfect implementation of the `NudGoo.dc.html` design
handoff** (from claude.ai/design), rebuilt in a production stack:

| Layer        | Tech                                                            |
| ------------ | --------------------------------------------------------------- |
| Frontend     | **Next.js 15** (App Router) · **TypeScript** (strict)           |
| Design system| Exact tokens + **Trirong / Sarabun / Noto Sans Thai / Inter** fonts + **Phosphor** icons |
| Backend / DB | **Supabase** scaffolding (client/server/Realtime) ready to wire |
| Deploy       | **Vercel** (free tier, zero-config)                             |
| PWA          | Web App Manifest + service worker (installable)                 |

The app runs entirely on **seeded in-memory state** (faithful to the
prototype) — no backend needed to explore. The Supabase layer is included and
ready to connect when you want it live.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

On a phone-width viewport the app fills the screen (true PWA); on a wide screen
it renders inside the exact **393×852 iPhone frame** from the mockup.

### Scripts

| Command             | Purpose                            |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Dev server                         |
| `npm run build`     | Production build                   |
| `npm run typecheck` | `tsc --noEmit` (strict)            |
| `npm run lint`      | ESLint                             |

---

## What's in it

A single-page state machine (auth → onboarding → app) faithfully ported from
the design, with bottom navigation **Chat · Calendar · 〔Trip〕 · Games · Ranks**.

- **Auth / Onboarding** — login & register, Google button, create-a-group
  (name + icon picker) or join-by-code, plus a "waiting for admin approval"
  state for new joiners.
- **Calendar** — month grid with event dots, upcoming-hangout cards, an event
  sheet with full RSVP list + reminder toggles.
- **Trip hub** — trip list, history, and a rich detail view: details card,
  expiring photo album, **live date voting** with progress bars, and
  **bill splitting** (treasurer's PromptPay QR, your dynamic share, confirm).
- **Chat** — group chat with reactions, replies, pins, **expiring photos**
  (live countdown), GIFs, polls, location cards, swipe-to-reveal time,
  long-press menu, a "who's muted" bar, and a search/links screen.
- **Games** — dice roll & draw-a-card.
- **Ranks** — Board Game / Most Late leaderboards with period filters and a
  champion card.
- **Profile & Group settings** — avatar/color picker, editable fields, saved
  PromptPay QR, light/dark theme, EN/ไทย language, member list with
  vote-to-mute, gang rules, and an **admin join-request approval** panel.

---

## Architecture

The design is data-driven, so the port mirrors its structure cleanly:

```
src/
├── app/
│   ├── layout.tsx          # fonts (Trirong/Sarabun/Inter) + Phosphor icons + PWA
│   ├── page.tsx            # renders <NudGooApp />
│   └── globals.css         # exact :root design tokens, keyframes, phone frame
├── lib/nudgoo/
│   ├── css.ts              # css() — parses the design's inline-style strings → React style
│   ├── types.ts            # State + entity types (strict)
│   ├── data.ts             # seeded data (friends, groups, chat, trips, board…)
│   ├── viewModel.ts        # buildViewModel() — the design's renderVals(), ported 1:1
│   └── useNudGoo.ts        # state machine + all actions (ported from the DCLogic class)
├── components/nudgoo/
│   ├── NudGooApp.tsx       # phone frame + screen router + overlays
│   ├── chrome/             # StatusBar, TopBar, BottomNav
│   ├── screens/            # Auth, Calendar, Trip, Chat, Games, Board, Profile, GroupSettings
│   └── overlays/           # bottom sheets, message menu, profile popup, toast
├── lib/supabase/           # browser/server clients + typed Realtime helper (for going live)
└── types/database.types.ts # DB schema types
supabase/schema.sql         # tables, RLS, triggers, Realtime publication
```

**Fidelity approach:** every screen carries the design's inline-style strings
verbatim through a tiny `css()` helper, and uses the same `ph ph-*` Phosphor
classes — so the output matches `NudGoo.dc.html` to the pixel. All design
tokens live in `globals.css` exactly as the source `:root`.

---

## Going live with Supabase (optional)

The prototype uses local state. To make it multi-user, run
[`supabase/schema.sql`](supabase/schema.sql) in your Supabase project, set
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`,
and swap the seeded data in `useNudGoo` for queries via `lib/supabase`
(the typed `subscribeToTable` helper is ready for Realtime chat, votes, etc.).
The design's admin-approval flow maps onto a `profiles.status` column + auth.

---

## Notes

- **Design source:** `NudGoo.dc.html` handoff. The boot screen is the login
  (as in the design); tap **Log in** → **Create a group** to enter the app.
- **Icons/fonts** load from CDN (Phosphor + Google Fonts) to match the mockup
  exactly; self-host them for fully offline use.
