import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
};

export function Badge({ children }: BadgeProps) {
  return <span className="pixel-chip px-3 py-1 text-sm">{children}</span>;
}
