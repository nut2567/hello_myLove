import type { ReactNode } from "react";
import Link from "next/link";

import { siteConfig } from "@/lib/site";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-surface/90">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link className="text-base font-semibold text-foreground" href="/">
            {siteConfig.name}
          </Link>
          <nav
            className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex"
            aria-label="Primary navigation"
          >
            <a
              className="transition-colors hover:text-foreground"
              href="/structure"
            >
              Structure
            </a>
            {/* <a className="transition-colors hover:text-foreground" href="/stack">
              Stack
            </a> */}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer id="stack" className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>app by nutศึ แวะมาดูบ่อยเดี๋ยวมีอะไรให้เล่น</p>
        </div>
      </footer>
    </div>
  );
}
