"use client";

import { useTranslations } from "next-intl";

import type { CSSProperties } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { HeartButton } from "@/components/ui/heart-button";
import { HeartGameAccess } from "@/components/heart-game-access";

type HeartGameClientProps = {
  authenticatedPlayerName?: string | null;
  className?: string;
  currentHeartId: string;
  captchaExpiry: number | null;
  recaptchaSiteKey: string;
  style?: CSSProperties;
};

export function HeartGameClient({
  authenticatedPlayerName = null,
  className,
  currentHeartId,
  captchaExpiry,
  recaptchaSiteKey,
  style,
}: HeartGameClientProps) {
  const t = useTranslations();
  return (
    <HeartGameAccess initialExpiry={captchaExpiry} siteKey={recaptchaSiteKey}>
      <NuqsAdapter>
        <HeartButton
          aria-label={t("HeartGame.generateAnotherRandomHeart")}
          authenticatedPlayerName={authenticatedPlayerName}
          className={className}
          currentHeartId={currentHeartId}
          style={style}
        />
      </NuqsAdapter>
    </HeartGameAccess>
  );
}
