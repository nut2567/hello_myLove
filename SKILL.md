---
name: hello-mylove-project
description: Implement features and fix bugs in the Hello MyLove repository (package name hello-my-love). Use for its Next.js routes, path access, MongoDB, pixel UI, heart game, robot drag game, and build setup. Apply only to this project or its checkouts.
---

# Hello MyLove Project Skill

Use this skill with this checkout's `AGENTS.md` and `CODEX.md`. All paths below are relative to the repository root. Read only the feature section and source files relevant to the request.

## Workflow

1. Check `git status --short`.
2. Read `AGENTS.md` and `CODEX.md`.
3. Check `package.json` and, when installed, `node_modules/next/package.json` for the actual framework version. Guides can lag dependency updates. Read the relevant local Next.js document in `node_modules/next/dist/docs/` before editing App Router APIs; search that directory if a documented filename has moved.
4. Inspect the smallest related source path before changing code.
5. Make scoped edits that match existing file patterns.
6. Run validation:
   - `npm run check` for code changes (ESLint and TypeScript).
   - Also run `npm run build` for routes, server actions, route handlers, auth, DB, config, dependencies, or Docker changes.
   - For UI/game changes, verify the affected route in a browser when tooling is available. Check the changed behavior on desktop and mobile when relevant. Reuse a suitable running server or choose a free port; stop servers started for the task unless the user asks to keep them running.
   - For skill/documentation-only changes, validate the skill frontmatter and referenced paths; application builds are unnecessary.

## Local Next.js Guides

Under `node_modules/next/dist/docs/01-app/01-getting-started/`:

| Change | Guide |
| --- | --- |
| Routes and layouts | `02-project-structure.md` |
| Server/client boundaries | `05-server-and-client-components.md` |
| Server Actions | `07-mutating-data.md` |
| API handlers | `15-route-handlers.md` |
| Request proxy | `16-proxy.md` |

For metadata, caching, cookies, headers, or other APIs, search the local `01-app/03-api-reference/` and `01-app/02-guides/` trees for the specific API. If dependencies or local docs are missing, report that limitation rather than assuming an older Next.js API.

## Project Patterns

- Keep Server Components as the default. Add `"use client"` only where state, effects, browser APIs, or event handlers are needed.
- Route groups such as `(site)` do not change URLs. Preserve typed routes and the existing async `params`/`searchParams` patterns; check the local API docs for `cookies()` and `headers()`.
- Use existing Server Actions in route folders for app mutations.
- Validate inputs and access at the server mutation/API boundary. Preserve intentional public flows such as guest heart players and credential sign-in; a proxy or client UI is not an authorization guard.
- Use `getMongoClient` or `getMongoDatabase` from `src/lib/mongodb.ts`. Preserve its lazy connection promise, retry cleanup, and pooling; do not create top-level Mongo clients elsewhere.
- Use `src/lib/date-time.ts` for all date/time access and Thai formatted strings.
- Match existing collection field names and types, including Thai timestamp strings. Check the current source before proposing schema changes.
- Use `@/*` imports for project source paths.

## Private Path Access and Visitor Tracking

- Read `src/auth.ts`, `src/types/next-auth.d.ts`, `src/lib/path-access.ts`, and `src/app/(site)/[[...slug]]/page.tsx` for private paths. The session's `pathName` must match the requested normalized path; having a session alone does not grant access to every path.
- Reuse the existing single-segment lowercase path normalization. Existing-user access logs use `logOnUser`; missing-path requests use `newUser`.
- For credentials, also read `src/lib/path-password.ts` and `src/lib/path-access-throttle.ts`. Store only Argon2id `pinHash`, verify on the server, and keep hashes out of public objects. Never store attempted passwords in logs. The NextAuth provider owns verification, logging, and throttling so direct API calls cannot bypass limits.
- Preserve pending-request password-change counts by verifying the existing hash instead of comparing newly salted hashes. Read `src/lib/path-pin-migration.ts` and the authentication section in `README.md` for migration; integration tests use disposable collections in `development`.
- Admin management lives in `src/lib/admin-users.ts`, `src/app/(site)/admin`, and `src/components/admin`. Keep a fresh database `role=admin` check on reads/mutations, throttled credential verification, reserved names, unique user names, and stale-form document/revision checks. Every delete requires the exact target name and current admin password. Protect admin records and preserve historical logs/game data. Password resets rotate `sessionId`; `src/lib/path-session.ts` rejects old/recreated-account tokens. Client input must never choose an admin role. Bootstrap via `scripts/create-admin.ts`, which explicitly selects the configured database.
- For tracking, read `src/proxy.ts`, `src/app/api/visitor/route.ts`, and `src/lib/visitor-tracking.ts` together. Keep the `event.waitUntil()` dispatch non-blocking and preserve the shared secret header contract and payload validation.
- Inspect the actual path exclusions and prefetch filters before changing them. Tracking is skipped without `VISITOR_TRACKING_SECRET`; stored visitor documents use `ipHash`, not raw IP.

## Heart Game

- Start with `src/app/(site)/th/heart/page.tsx`, `[id]/page.tsx`, `layout.tsx`, and `actions.ts`; follow `src/components/ui/heart-button.tsx`, `src/components/heart-game-provider.tsx`, `src/components/heart-game-client.tsx`, `src/lib/heart-id.ts`, and `src/lib/heart-game-store.ts` as needed.
- Keep gameplay score/status in Redux and query state in `nuqs`. Preserve the provider across `/th/heart/[id]` navigation, ID validation, query synchronization, and cheating/reset behavior.
- `createHeartGamePlayer` validates and returns a guest/named identity; it currently does not write a player document. Client identity is stored in localStorage. Do not infer database persistence from the action name.
- `saveHeartGameScore` writes to `heart_game` and intentionally accepts an authenticated path player or a validated guest/named identity. Preserve those flows and existing validation unless the request changes them.
- When changing scoring or persistence, verify normal clicks, fake-heart game over, reset, and the affected guest/authenticated flow. Check that saving uses the captured game-over score rather than the already-reset live score.

## Pixel UI and Shell

- Inspect `src/app/globals.css`, `src/components/layout/site-shell.tsx`, and the relevant layout before styling. Reuse `pixel-panel`, `pixel-chip`, `pixel-input`, `pixel-button`, and shell classes when they fit.
- Tailwind 4 tokens live in `@theme inline`; avoid circular font variables. Match nearby cyan/lime/pink accents, hard borders, square shadows, and mono UI text unless the user requests a new design.
- The shell exposes `heart-score-header-slot`; preserve that integration when editing header markup. Check Thai text, compact controls, focus states, and overflow at relevant viewport widths.

## Robot Drag Game

- Trace `/th/RobotDragGame` through `src/components/RobotDragGame.tsx` before selecting a version; V1 and V2 coexist. For V2, read `src/components/robot-drag-game/V2/RobotDragGameV2.tsx` and only the related `models.tsx`, `ArenaFloor.tsx`, `robotConfigs.ts`, or `types.ts` files.
- Gameplay positions use X/Z on the floor and Y for height. Model fronts point toward -Z; keep geometry and `getForwardYaw` consistent.
- Scale, collision radii, target radius, arena bounds, camera framing, and dock spacing are related. When adding a robot, update `RobotId`, configuration, count, and dock positions together.
- Preserve delta-based movement and the existing state/ref synchronization in `useFrame`. For drag changes, check offsets, boundary clamping, pointer-up/cancel cleanup, and camera controls while dragging.
- Verify the affected difficulty, target visibility/reveal, capture/removal behavior, and restart. Read the V2 notes in `README.md` for deeper gameplay context rather than duplicating them here.

## Dependency Rule

When dependencies change, keep both lockfiles consistent using the project's existing package managers:

```powershell
npm install
bun install --lockfile-only
```

Docker uses `bun.lock`; local checks use npm scripts.

Read `Dockerfile`, `docker-compose.yaml`, `build-docker.ps1`, and `next.config.ts` when changing container behavior. The production image uses a standalone Next build and runs `bun server.js` on port 3600. Preserve unrelated pending dependency/lockfile edits. Never commit environment files or secrets.
