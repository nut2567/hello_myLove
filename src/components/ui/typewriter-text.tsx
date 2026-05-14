"use client";

import { useEffect, useMemo, useState } from "react";

type TypewriterTextProps = {
  className?: string;
  cursor?: string;
  cursorClassName?: string;
  speedMs?: number;
  startDelayMs?: number;
  text: string;
};

export function TypewriterText({
  className = "",
  cursor = "_",
  cursorClassName = "pixel-cursor",
  speedMs = 58,
  startDelayMs = 180,
  text,
}: TypewriterTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const characters = useMemo(() => Array.from(text), [text]);
  const visibleText = characters.slice(0, visibleCount).join("");

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;
    const safeSpeedMs = Math.max(16, speedMs);
    const safeStartDelayMs = Math.max(0, startDelayMs);

    queueMicrotask(() => {
      if (!cancelled) {
        setVisibleCount(0);
      }
    });

    const timeoutId = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      intervalId = window.setInterval(() => {
        setVisibleCount((currentCount) => {
          if (currentCount >= characters.length) {
            if (intervalId !== undefined) {
              window.clearInterval(intervalId);
            }

            return currentCount;
          }

          return currentCount + 1;
        });
      }, safeSpeedMs);
    }, safeStartDelayMs);

    return () => {
      cancelled = true;

      window.clearTimeout(timeoutId);

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [characters.length, speedMs, startDelayMs, text]);

  return (
    <span aria-label={text} className={className}>
      <span aria-hidden="true">{visibleText}</span>
      <span aria-hidden="true" className={cursorClassName}>
        {cursor}
      </span>
    </span>
  );
}
