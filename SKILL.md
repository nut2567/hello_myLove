---
name: hello-mylove-project
description: Project-specific workflow for the Hello MyLove Next.js app. Use when modifying this repository's App Router routes, Server Actions, MongoDB persistence, NextAuth path access, heart game, visitor tracking proxy, Tailwind pixel UI, React Three Fiber robot game, Docker build, or dependency setup.
---

# Hello MyLove Project Skill

Use this skill for implementation work in this repository. Keep this file concise; read `CODEX.md` for the fuller project guide.

## Workflow

1. Check `git status --short`.
2. Read `AGENTS.md` and `CODEX.md`.
3. Read the relevant local Next.js document in `node_modules/next/dist/docs/` before editing App Router APIs.
4. Inspect the smallest related source path before changing code.
5. Make scoped edits that match existing file patterns.
6. Run validation:
   - `npm run check` for normal changes.
   - `npm run build` for route, server action, auth, DB, config, dependency, or Docker changes.

## Project Patterns

- Keep Server Components as the default. Add `"use client"` only where state, effects, browser APIs, or event handlers are needed.
- Use existing Server Actions in route folders for app mutations.
- Use `src/lib/mongodb.ts` for MongoDB. Do not create top-level Mongo clients elsewhere.
- Use `src/lib/date-time.ts` for all date/time access and Thai formatted strings.
- Use `src/auth.ts` and `src/lib/path-access.ts` for path-based auth behavior.
- Use pixel UI classes from `src/app/globals.css` before adding new component styling.
- Use `@/*` imports for project source paths.

## Feature Areas

- Heart game: read `src/app/(site)/th/heart/actions.ts`, `src/components/ui/heart-button.tsx`, `src/lib/heart-id.ts`, and `src/lib/heart-game-store.ts`.
- Private path access: read `src/app/(site)/[[...slug]]/page.tsx`, `src/lib/path-access.ts`, and `src/auth.ts`.
- Visitor tracking: read `src/proxy.ts` and `src/app/api/visitor/route.ts`.
- Robot drag game V2: read `src/components/robot-drag-game/V2/RobotDragGameV2.tsx`, `models.tsx`, `robotConfigs.ts`, and `types.ts`.
- Layout and shell: read `src/components/layout/site-shell.tsx`, `src/app/layout.tsx`, and `src/app/(site)/layout.tsx`.

## Dependency Rule

If `package.json` changes, keep both lockfiles consistent:

```powershell
npm install
bun install --lockfile-only
```

Docker uses `bun.lock`; local checks use npm scripts.
