"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";

import { makeHeartGameStore } from "@/lib/heart-game-store";

type HeartGameProviderProps = {
  children: ReactNode;
};

export function HeartGameProvider({ children }: HeartGameProviderProps) {
  const [store] = useState(makeHeartGameStore);

  return (
    <Provider store={store}>{children}</Provider>
  );
}
