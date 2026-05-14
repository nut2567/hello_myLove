<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Agent Entry Point

Before making non-trivial changes in this repository:

1. Read `CODEX.md` for project workflow, architecture, and validation rules.
2. Read `SKILL.md` when implementing features, fixing bugs, or changing project conventions.
3. Inspect the existing code path first and preserve local patterns.

Use local Next.js docs from `node_modules/next/dist/docs/` for App Router APIs. This project is on Next.js 16.2.4, React 19.2, Tailwind CSS 4, MongoDB, NextAuth v5 beta, dayjs, Redux Toolkit, Framer Motion, and React Three Fiber.

Run `npm run check` for normal validation. Run `npm run build` when touching routes, server actions, Next config, dependencies, auth, database code, or Docker-related behavior.
