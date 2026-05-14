"use client";

import type { CSSProperties } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { HeartButton } from "@/components/ui/heart-button";

type HeartGameClientProps = {
  authenticatedPlayerName?: string | null;
  className?: string;
  currentHeartId: string;
  style?: CSSProperties;
};

export function HeartGameClient({
  authenticatedPlayerName = null,
  className,
  currentHeartId,
  style,
}: HeartGameClientProps) {
  return (
    <NuqsAdapter>
      <HeartButton
        aria-label="Generate another random heart"
        authenticatedPlayerName={authenticatedPlayerName}
        className={className}
        currentHeartId={currentHeartId}
        style={style}
      />
    </NuqsAdapter>
  );
}
