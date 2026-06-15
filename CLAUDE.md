# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (Next.js 16 on localhost:3000)
npm run build        # prisma generate + next build
npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma generate  # Regenerate client after schema changes
npx prisma studio    # Browse/edit data
```

The Prisma client is generated into `app/generated/prisma/` (not the default location). Always import from `@/app/generated/prisma/client`.

## Environment Variables

- `DATABASE_URL` — libSQL URL (`file:./dev.db` locally, Turso URL in prod)
- `TURSO_AUTH_TOKEN` — required in production, omit locally
- `JWT_SECRET` — signs auth cookies; has a hardcoded fallback for dev

## Architecture

### Multi-tenant apartment system

The app is a cricket stats tracker for multiple apartment leagues ("apartments"). Each apartment has a `slug`. There are two parallel routing systems:

1. **`/[slug]/...` routes** (`app/[slug]/`) — per-apartment views. The layout at `app/[slug]/layout.tsx` fetches the apartment by slug and renders `ApartmentNavbar` + `SlugMain`. Pages here receive `params: Promise<{ slug: string }>` and call `getApartmentOrNotFound(slug)` from `lib/apartment.ts`.

2. **Root routes** (`/stats`, `/bowling`, `/mvp`, etc.) — legacy single-apartment views that still exist. The root `Navbar` hides itself on slug routes (see `isSlugRoute()` in `components/Navbar.tsx`).

The `RESERVED` set in `Navbar.tsx` defines which top-level segments are not treated as apartment slugs.

### Database & Prisma

SQLite locally, Turso (libSQL) in production. The adapter wiring is in `lib/db.ts` — `PrismaLibSql` adapter wraps `PrismaClient`. The singleton pattern prevents connection exhaustion in dev hot-reload.

All stat aggregations happen in `lib/queries.ts` — these are the canonical functions for leaderboards, rivals, milestones, and standings. They accept `apartmentId` and optional `format`/`season` filters.

### Auth

JWT stored as an `httpOnly` cookie named `mpl-token`. Cookie is `secure + sameSite: none` in production, `lax` locally. `lib/jwt.ts` holds `signToken` / `verifyToken`. The `TokenPayload` type carries `userId`, `username`, `role`, `status`, `permissions[]`, `apartmentId`, and `slug`.

Roles: `user`, `admin`, `superadmin`. The `permissions` field is a JSON-serialized string array of allowed route prefixes; `"*"` grants all access. Route protection happens client-side in page components by calling `/api/auth/me`.

### API routes

All under `app/api/`. Pattern: read the JWT cookie, verify it, then query Prisma. No middleware file — auth is checked per-route.

- `/api/auth/*` — login, signup, logout, me
- `/api/leaderboard/{batting,bowling,explosive}` — root-level leaderboard data (legacy)
- `/api/matches`, `/api/players`, `/api/profiles`, `/api/mvp` — CRUD for match data, scoped by `apartmentId` from the token
- `/api/admin/users` — admin user management
- `/api/apartments` — list/create apartments
- `/api/superadmin/leaderboard` — cross-apartment combined leaderboard

### Match result calculation

`lib/result.ts` exports `calculateResult()` which derives the match result string from batting rows. Supports T20/ODI (2 innings) and TEST (up to 4 innings with innings-victory logic). This is called when saving a match — there is no stored result field computed separately.

### Key components

- `LeaderboardTable` — generic sortable table; takes `rows`, `columns` with optional `format` function, `accentColor`, `rankLabel`, `primaryKey`
- `FormatFilter` — URL-driven format picker (T20/ODI/TEST), uses `useSearchParams`
- `SeasonFilter` — same pattern for season filtering
- `MatchForm` — large client component for creating/editing matches; handles multi-innings batting/bowling entry
- `ConditionalMain` / `SlugMain` — wrappers that apply padding/max-width, used to avoid applying layout styles on login/signup
