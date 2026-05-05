import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";

type SiteLayoutProps = {
  children: ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  return <SiteShell>{children}</SiteShell>;
}
