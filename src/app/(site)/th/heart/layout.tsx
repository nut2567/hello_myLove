import { Suspense, type ReactNode } from "react";

import { HeartGameProvider } from "@/components/heart-game-provider";

type HeartLayoutProps = {
  children: ReactNode;
};

export default function HeartLayout({ children }: HeartLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="pixel-panel px-5 py-3 text-sm font-black uppercase text-cyan-200">
            Loading heart game
          </div>
        </div>
      }
    >
      <HeartGameProvider>{children}</HeartGameProvider>
    </Suspense>
  );
}
