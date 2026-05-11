"use client";

import type { CSSProperties } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { HeartButton } from "@/components/ui/heart-button";

type HeartGameClientProps = {
  className?: string;
  nextHeartId: number;
  style?: CSSProperties;
};

export function HeartGameClient({
  className,
  nextHeartId,
  style,
}: HeartGameClientProps) {
  return (
    <NuqsAdapter>
      <HeartButton
        aria-label="Generate another random heart"
        className={className}
        nextHeartId={nextHeartId}
        style={style}
      />
    </NuqsAdapter>
  );
}
