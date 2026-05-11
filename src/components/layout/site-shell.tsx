import type { ReactNode } from "react";
import Link from "next/link";

import { siteConfig } from "@/lib/site";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="pixel-app-shell flex min-h-dvh flex-col">
      <header className="pixel-shell-bar shrink-0 border-b-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link className="pixel-shell-link text-base" href="/">
            {siteConfig.name}
          </Link>
          <nav
            className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex"
            aria-label="Primary navigation"
          >
            <Link
              className="pixel-shell-link"
              href="/th/structure"
            >
              Structure
            </Link>
            <Link
              className="pixel-shell-link"
              href="/th/heart"
            >
              Heart
            </Link>
            <Link
              className="pixel-shell-link"
              href="/th/logo"
            >
              Logo
            </Link>
            <Link
              className="pixel-shell-link"
              href="/th/RobotDragGame"
            >
              Robot Drag Game
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer id="stack" className="pixel-shell-bar shrink-0 border-t-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>app by nutศึ แวะมาดูบ่อยเดี๋ยวมีอะไรให้เล่น</p>
        </div>
      </footer>
    </div>
  );
}
