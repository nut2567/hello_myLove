# Hello MyLove Agent Guide

This file is the shared project guide for coding agents. Prefer the current codebase over assumptions, and keep changes scoped to the requested feature or bug.

## Stack

- Next.js 16.2.4 App Router in `src/app`
- React 19.2.4 with Server Components by default
- TypeScript strict mode and typed Next routes
- Tailwind CSS 4 in `src/app/globals.css`
- MongoDB via `src/lib/mongodb.ts`
- NextAuth v5 beta credentials auth in `src/auth.ts`
- dayjs time helpers in `src/lib/date-time.ts`
- Redux Toolkit for heart game state
- React Three Fiber and drei for 3D game scenes
- Docker production image uses Bun and `bun.lock`

## First Steps

1. Read `AGENTS.md`.
2. Read the relevant local Next.js guide under `node_modules/next/dist/docs/` before changing Next APIs, routes, layouts, server actions, route handlers, proxy, cache behavior, or metadata.
3. Inspect nearby source files before editing.
4. Check `git status --short` and do not revert unrelated work.

Useful local docs:

- Server/client components: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- Server actions: `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- Route handlers: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- Proxy: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- Project structure: `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`

## Architecture Rules

- Keep route files under `src/app`. Route groups like `(site)` do not affect URLs.
- Keep interactive UI in small Client Components with `"use client"`. Do not move whole routes to the client unless necessary.
- In App Router files, `params`, `searchParams`, `cookies()`, and `headers()` are async in this Next version.
- Use Server Actions for app mutations and Route Handlers for APIs, webhooks, and external callers.
- Validate auth and authorization inside every Server Action or Route Handler. Do not rely on `proxy.ts` as the only guard.
- Do not initialize database clients or service SDKs at module scope. Use the existing lazy singleton pattern in `src/lib/mongodb.ts`.

## Data And Time

- Use `src/lib/mongodb.ts` for database access.
- Use `src/lib/date-time.ts` for all current dates, timestamps, Thai time strings, and daily reset calculations.
- Do not add new `Intl.DateTimeFormat`, `new Date()`, or `Date.now()` call sites when an existing time helper fits.
- Database fields in this project often store Thai formatted strings. Match the existing collection shape before changing field names.
- Never commit `.env*` files or secrets.

## Auth And Private Paths

- Path access is implemented in `src/lib/path-access.ts`, `src/auth.ts`, and `src/app/(site)/[[...slug]]/page.tsx`.
- Path names are normalized to a single lowercase segment with letters, numbers, `_`, and `-`.
- Existing user access logs go to `logOnUser`; missing path requests go to `newUser`.

## Heart Game

- Route: `/th/heart` redirects to `/th/heart/[id]`.
- Main files:
  - `src/app/(site)/th/heart/page.tsx`
  - `src/app/(site)/th/heart/[id]/page.tsx`
  - `src/app/(site)/th/heart/actions.ts`
  - `src/components/ui/heart-button.tsx`
  - `src/lib/heart-id.ts`
  - `src/lib/heart-game-store.ts`
- Keep score state in Redux and URL query state in `nuqs`.
- Guest/named player creation is saved through `createHeartGamePlayer`.
- Score persistence is saved through `saveHeartGameScore`.
- Keep MongoDB document shapes intentional. Do not add score/player fields unless the requested collection needs them.

## Visitor Tracking

- Next 16 uses `src/proxy.ts`, not middleware.
- `proxy.ts` queues visitor tracking with `event.waitUntil()` and posts to `/api/visitor`.
- Set `VISITOR_TRACKING_SECRET` so `proxy.ts` can authenticate requests to `/api/visitor`; tracking is skipped when it is missing.
- Keep tracking non-blocking and avoid tracking static assets, auth APIs, visitor APIs, prefetches, and `/th` routes unless requirements change.

## UI And Styling

- Reuse the pixel UI classes in `src/app/globals.css`: `pixel-panel`, `pixel-chip`, `pixel-input`, `pixel-button`, and shell classes.
- Tailwind CSS 4 theme tokens live in `@theme inline`; keep font values literal, not circular CSS variables.
- Keep the dark pixel style consistent: cyan/lime/pink accents, hard borders, square shadows, and mono UI text.
- Avoid one-off colors when existing CSS variables or pixel classes fit.
- Keep text fitting in compact controls on mobile and desktop.

## Robot Drag Game V2

- Start with `src/components/robot-drag-game/V2/RobotDragGameV2.tsx`.
- Visual models live in `models.tsx`.
- Field size, model scale, radii, robot IDs, and difficulty live in `robotConfigs.ts`.
- Gameplay coordinates use X/Z for floor position and Y for height.
- If model scale changes, review collision radii and target radius.
- If a model appears to move backward, check `getForwardYaw` and the model's forward geometry direction.

## Dependencies And Docker

- Local scripts use npm:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run check`
  - `npm run build`
- If dependencies change, update both `package-lock.json` and `bun.lock`. Docker uses `bun install --frozen-lockfile`.
- Docker runtime listens on port `3600` and starts the standalone Next server with Bun.

## Validation

- Run `npm run check` after code edits.
- Run `npm run build` after touching Next routes, server actions, route handlers, auth, DB utilities, config, dependencies, or Docker.
- For frontend/game changes, start a local server and verify the relevant route in a browser when browser tooling is available.
- If a dev server is already running, use an available port instead of killing unrelated processes.
