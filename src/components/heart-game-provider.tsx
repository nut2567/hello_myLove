"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { makeHeartGameStore } from "@/lib/heart-game-store";

type HeartGameProviderProps = {
  children: ReactNode;
};

export function HeartGameProvider({ children }: HeartGameProviderProps) {
  const [store] = useState(makeHeartGameStore);

  return (
    <NuqsAdapter>
      <Provider store={store}>{children}</Provider>
    </NuqsAdapter>
  );
}
