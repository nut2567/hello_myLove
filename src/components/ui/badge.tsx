import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
};

export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex rounded-md border border-accent/25 bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
      {children}
    </span>
  );
}
