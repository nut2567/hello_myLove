"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function HeartLeaderboardError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("HeartLeaderboard");
  useEffect(() => { console.error(error); }, [error]);

  return (
    <section className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div className="pixel-panel p-6 sm:p-8">
        <h1 className="text-2xl font-black text-foreground">{t("title")}</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground" role="alert">{t("loadError")}</p>
        <button className="pixel-button mt-6 min-h-11 px-4 py-3 text-sm" onClick={reset} type="button">
          {t("retry")}
        </button>
      </div>
    </section>
  );
}
