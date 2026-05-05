# Hello MyLove

This app is structured for [Next.js 16](https://nextjs.org/docs) and
[Tailwind CSS 4](https://tailwindcss.com/docs).

## Stack

- Next.js 16 App Router with Turbopack defaults
- React 19
- Tailwind CSS 4 with `@tailwindcss/postcss`
- TypeScript, ESLint flat config, and the `src` application folder

## Project Structure

```txt
src/
  app/                 Route files, root layout, global Tailwind import
  components/home/     Home page sections
  components/layout/   Shared app shells and layout components
  components/ui/       Reusable UI primitives
  lib/                 Shared data and configuration
```

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Run all local checks:

```bash
npm run check
npm run build
```

## Tailwind

Tailwind is loaded from `src/app/globals.css`:

```css
@import "tailwindcss";
```

Semantic design tokens are defined in the same file with `@theme inline`, so
components can use classes like `bg-surface`, `text-muted-foreground`, and
`border-border` without a separate `tailwind.config` file.
