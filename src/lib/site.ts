export const siteConfig = {
  name: "Hello MyLove",
  title: "A structured Next 16 app foundation.",
  description:
    "The starter screen is now split into route, layout, home, UI, and data layers with Tailwind CSS 4 driving the design tokens.",
  links: {
    nextDocs: "https://nextjs.org/docs",
    tailwindDocs: "https://tailwindcss.com/docs",
  },
} as const;

export const stackItems = [
  {
    label: "Next.js",
    value: "16.2.4",
    detail: "App Router with Turbopack defaults for development and builds.",
  },
  {
    label: "React",
    value: "19.2.4",
    detail: "Server Components first, with client components added only as needed.",
  },
  {
    label: "Tailwind",
    value: "4.2.4",
    detail: "CSS-first configuration through `@import` and `@theme`.",
  },
] as const;

export const projectPillars = [
  {
    kicker: "Routing",
    title: "Route groups",
    description:
      "`src/app/(site)/page.tsx` keeps the public URL at `/` while leaving room for future app sections.",
  },
  {
    kicker: "Interface",
    title: "Shared components",
    description:
      "Page sections, layout shell, and UI primitives are separated so future screens can reuse them cleanly.",
  },
  {
    kicker: "Styling",
    title: "Theme tokens",
    description:
      "Global CSS exposes semantic Tailwind colors like `bg-surface`, `text-muted-foreground`, and `border-border`.",
  },
] as const;

export const workspaceTree = `src/
  app/
    (site)/
      page.tsx
    globals.css
    layout.tsx
  components/
    home/
      feature-grid.tsx
      hero-section.tsx
      workspace-section.tsx
    layout/
      site-shell.tsx
    ui/
      badge.tsx
      button-link.tsx
  lib/
    site.ts`;
