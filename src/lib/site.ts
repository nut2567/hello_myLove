export const siteConfig = {
  name: "Hello Unew",
  title: "Project.aStructuredNext16AppFoundation",
  description:
    "Project.theStarterScreenIsNowSplitIntoRouteLayoutHome",
  links: {
    nextDocs: "https://nextjs.org/docs",
    tailwindDocs: "https://tailwindcss.com/docs",
  },
} as const;

export const stackItems = [
  {
    label: "Next.js",
    value: "16.2.4",
    detail: "Project.appRouterWithTurbopackDefaultsForDevelopmentAndBuilds",
  },
  {
    label: "React",
    value: "19.2.4",
    detail:
      "Project.serverComponentsFirstWithClientComponentsAddedOnlyAsNeeded",
  },
  {
    label: "Tailwind",
    value: "4.2.4",
    detail: "Project.cssFirstConfigurationThroughImportAndTheme",
  },
] as const;

export const projectPillars = [
  {
    kicker: "Project.routing",
    title: "Project.routeGroups",
    description:
      "Project.srcAppSitePageTsxKeepsThePublicURLAt",
  },
  {
    kicker: "Project.interface",
    title: "Project.sharedComponents",
    description:
      "Project.pageSectionsLayoutShellAndUIPrimitivesAreSeparatedSo",
  },
  {
    kicker: "Project.styling",
    title: "Project.themeTokens",
    description:
      "Project.globalCSSExposesSemanticTailwindColorsLikeBgSurfaceText",
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
