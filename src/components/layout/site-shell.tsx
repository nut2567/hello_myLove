"use client";

import { useTranslations } from "next-intl";

import type { ReactNode } from "react";
import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { PixelProjectLogo } from "@/components/ui/pixel-project-logo";
import { AccessibilityControls } from "@/components/layout/accessibility-controls";
import { MobileNavigation, SiteNavigationLinks } from "@/components/layout/site-navigation";
import { VisitorStats } from "@/components/layout/visitor-stats";


type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const t = useTranslations();
  return (
    <div className="pixel-app-shell flex min-h-dvh flex-col">
      <header className="pixel-shell-header pixel-shell-bar shrink-0 border-b-4 backdrop-blur-sm bg-transparent">
        <div className="container mx-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-4 sm:gap-4 sm:px-6 lg:flex lg:flex-wrap lg:justify-between">
          <Link
            aria-label={siteConfig.name}
            className="inline-flex min-w-0 max-w-full justify-self-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 lg:shrink-0 [&_.pixel-project-logo]:max-w-full"
            href="/"
          >
            <PixelProjectLogo name={siteConfig.name} />
          </Link>
          <nav
            className="hidden flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground lg:flex"
            aria-label={t("Navigation.primary")}
          >
            <SiteNavigationLinks />
          </nav>
          <div className="contents lg:ml-auto lg:flex lg:max-w-full lg:flex-wrap lg:items-center lg:justify-end lg:gap-3">
            <div
              className="col-span-2 row-start-2 flex min-w-0 items-center justify-end empty:hidden"
              id="heart-score-header-slot"
            />
            <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-2 lg:gap-3">
              <MobileNavigation />
              <AccessibilityControls />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer id="stack" className="pixel-shell-bar shrink-0 border-t-4">
        <div className="container mx-auto grid grid-cols-1 items-center gap-4 px-4 py-6 text-center text-sm text-muted-foreground sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
          <p className="lg:justify-self-start lg:text-left">{t("Navigation.appByNut")}</p>
          <VisitorStats />
          <p className="lg:justify-self-end lg:text-right">{t("Navigation.earlyAccessV02192")}</p>
        </div>
      </footer>
    </div>
  );
}
