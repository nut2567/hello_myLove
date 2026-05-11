import type { ReactNode } from "react";

import { HeartGameProvider } from "@/components/heart-game-provider";

type HeartLayoutProps = {
  children: ReactNode;
};

export default function HeartLayout({ children }: HeartLayoutProps) {
  return <HeartGameProvider>{children}</HeartGameProvider>;
}
