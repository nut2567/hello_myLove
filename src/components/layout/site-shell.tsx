"use client";

import { useTranslations } from "next-intl";

import type { ReactNode } from "react";
import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { PixelProjectLogo } from "@/components/ui/pixel-project-logo";
import { AccessibilityControls } from "@/components/layout/accessibility-controls";
import { VisitorStats } from "@/components/layout/visitor-stats";


type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const t = useTranslations();
  return (
    <div className="pixel-app-shell flex min-h-dvh flex-col">
      <header className="pixel-shell-header pixel-shell-bar shrink-0 border-b-4 backdrop-blur-sm bg-transparent">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">
          <Link
            aria-label={siteConfig.name}
            className="inline-flex shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
            href="/"
          >
            <PixelProjectLogo name={siteConfig.name} />
          </Link>
          <nav
            className="order-last flex w-full flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground lg:order-none lg:w-auto"
            aria-label={t("Navigation.primary")}
          >
            <Link className="pixel-shell-link" href="/th/structure">{t("Navigation.structure")}</Link>
            <Link className="pixel-shell-link" href="/th/heart">{t("Navigation.heart")}</Link>
            <Link className="pixel-shell-link" href="/th/heart/leaderboard" prefetch={false}>{t("Navigation.heartLeaderboard")}</Link>
            <Link className="pixel-shell-link" href="/th/logo">{t("Navigation.logo")}</Link>
            <Link className="pixel-shell-link" href="/th/RobotDragGame">{t("Navigation.robotGame")}</Link>
          </nav>
          <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-3">
            <div
              className="flex items-center justify-end empty:hidden"
              id="heart-score-header-slot"
            />
            <AccessibilityControls />
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
