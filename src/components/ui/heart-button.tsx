"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type CSSProperties, ViewTransition } from "react";
import { IoMdHeart } from "react-icons/io";
import { parseAsInteger, useQueryState } from "nuqs";

import { useHeartGameDispatch, useHeartGameSelector } from "@/lib/heart-game-hooks";
import { markCheated, recordHeartClick } from "@/lib/heart-game-store";

type HeartButtonProps = {
  "aria-label": string;
  className?: string;
  style?: CSSProperties;
};

const MIN_HEART_ID = 100_000;
const MAX_HEART_ID = 999_999;

function generateHeartId(): number {
  const range = MAX_HEART_ID - MIN_HEART_ID + 1;

  return Math.floor(Math.random() * range) + MIN_HEART_ID;
}

function getHeartRoute(id: number, score: number): Route {
  return `/th/heart/${id}?score=${score}` as Route;
}

export function HeartButton({
  "aria-label": ariaLabel,
  className = "",
  style,
}: HeartButtonProps) {
  const router = useRouter();
  const dispatch = useHeartGameDispatch();
  const score = useHeartGameSelector((state) => state.heartGame.score);
  const cheated = useHeartGameSelector((state) => state.heartGame.cheated);
  const [urlScore, setUrlScore] = useQueryState(
    "score",
    parseAsInteger.withDefault(0),
  );
  const trustedUrlScoresRef = useRef<Set<number>>(new Set([0]));

  useEffect(() => {
    if (urlScore === score) {
      trustedUrlScoresRef.current = new Set([score]);
      return;
    }

    if (trustedUrlScoresRef.current.has(urlScore)) {
      return;
    }

    trustedUrlScoresRef.current = new Set([0]);
    dispatch(markCheated());
    void setUrlScore(0, { history: "replace" });
  }, [dispatch, score, setUrlScore, urlScore]);

  function goToRandomHeart() {
    const nextScore = score + 1;
    const previousTrustedScores = trustedUrlScoresRef.current;

    trustedUrlScoresRef.current = new Set([
      ...previousTrustedScores,
      nextScore,
    ]);
    dispatch(recordHeartClick());
    void setUrlScore(nextScore, { history: "replace" });
    router.push(getHeartRoute(generateHeartId(), nextScore));
  }

  return (
    <>
      <div
        aria-live="polite"
        className="pixel-panel fixed left-1/2 top-24 z-40 min-w-64 -translate-x-1/2 px-4 py-3 text-center text-sm"
      >
        {cheated ? (
          <p className="font-black uppercase text-red-200">
            You cheated in the game
          </p>
        ) : (
          <div className="grid gap-1">
            <p className="font-black uppercase text-lime-200">
              Score {score}
            </p>
            <p className="text-xs font-bold text-cyan-200">
              nuqs ?score={urlScore}
            </p>
          </div>
        )}
      </div>

      <ViewTransition name="IoMdHeart">
        <button
          aria-label={ariaLabel}
          className={`inline-flex size-24 cursor-pointer items-center justify-center text-red-300 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${className}`}
          onClick={goToRandomHeart}
          style={style}
          type="button"
        >
          <IoMdHeart aria-hidden className="size-20" />
        </button>
      </ViewTransition>
    </>
  );
}
