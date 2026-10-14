"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

import type { VisitorStats as VisitorStatsData } from "@/lib/visitor-stats";

export function VisitorStats() {
  const t = useTranslations("VisitorStats");
  const format = useFormatter();
  const [stats, setStats] = useState<VisitorStatsData | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;

    async function refresh() {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      try {
        const response = await fetch("/api/visitor", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Visitor statistics unavailable.");
        const value: VisitorStatsData = await response.json();
        if (
          !Number.isSafeInteger(value.total) ||
          value.total < 0 ||
          !Number.isSafeInteger(value.today) ||
          value.today < 0 ||
          typeof value.date !== "string"
        ) {
          throw new Error("Invalid visitor statistics.");
        }
        if (!controller.signal.aborted) {
          setStats(value);
          setUnavailable(false);
        }
      } catch {
        if (!controller.signal.aborted) setUnavailable(true);
      } finally {
        pending = false;
      }
    }

    void refresh();
    // The second read also picks up the current visit's background DB write.
    const initialRefresh = window.setTimeout(() => void refresh(), 2_000);
    const interval = window.setInterval(() => void refresh(), 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return (
    <section
      aria-label={t("title")}
      aria-busy={!stats && !unavailable}
      className="min-w-0 text-center"
    >
      <dl className="flex flex-wrap justify-center gap-2 text-xs">
        {(["total", "today"] as const).map((key) => (
          <div
            key={key}
            className="flex flex-wrap items-baseline justify-center gap-x-2 border-2 border-border bg-surface px-3 py-2"
          >
            <dt>{t(key)}</dt>
            <dd className="font-bold tabular-nums text-foreground">
              {stats ? `${format.number(stats[key])} ${t("times")}` : "—"}
            </dd>
          </div>
        ))}
      </dl>
      {unavailable && !stats ? (
        <p className="mt-2 text-xs" role="status">
          {t("unavailable")}
        </p>
      ) : null}
    </section>
  );
}
