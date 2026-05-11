"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  ViewTransition,
} from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { IoMdHeart } from "react-icons/io";
import { parseAsInteger, useQueryState } from "nuqs";

import {
  useHeartGameDispatch,
  useHeartGameSelector,
} from "@/lib/heart-game-hooks";
import {
  markCheated,
  recordFakeHeartClick,
  recordHeartClick,
} from "@/lib/heart-game-store";
import { createHeartRoute, getHeartPosition } from "@/lib/heart-id";

type HeartButtonProps = {
  "aria-label": string;
  className?: string;
  nextHeartId: number;
  style?: CSSProperties;
};

const HEART_SCORE_HEADER_SLOT_ID = "heart-score-header-slot";
const POINTS_PER_FAKE_HEART = 10;

function getHeartScoreHeaderSlot() {
  return document.getElementById(HEART_SCORE_HEADER_SLOT_ID);
}

function subscribeToHeartScoreHeaderSlot(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}

function createFakeHeart(index: number, score: number) {
  const level = Math.max(1, Math.floor(score / POINTS_PER_FAKE_HEART));
  const seed = `fake-heart-${level}-${index}`;
  const direction = index % 2 === 0 ? 1 : -1;

  return {
    driftX: direction * (24 + index * 7),
    driftY: ((index % 3) - 1) * 18,
    id: seed,
    rotate: direction * (8 + index * 3),
    style: getHeartPosition(seed),
  };
}

export function HeartButton({
  "aria-label": ariaLabel,
  className = "",
  nextHeartId,
  style,
}: HeartButtonProps) {
  const router = useRouter();
  const dispatch = useHeartGameDispatch();
  const score = useHeartGameSelector((state) => state.heartGame.score);
  const cheated = useHeartGameSelector((state) => state.heartGame.cheated);
  const gameOver = useHeartGameSelector((state) => state.heartGame.gameOver);
  const [urlScore, setUrlScore] = useQueryState(
    "score",
    parseAsInteger.withDefault(0),
  );
  const scoreHeaderSlot = useSyncExternalStore(
    subscribeToHeartScoreHeaderSlot,
    getHeartScoreHeaderSlot,
    () => null,
  );
  const trustedUrlScoresRef = useRef<Set<number>>(new Set([0]));
  const fakeHearts = Array.from(
    { length: Math.floor(score / POINTS_PER_FAKE_HEART) },
    (_, index) => createFakeHeart(index, score),
  );

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
    router.push(createHeartRoute(nextHeartId, nextScore), { scroll: false });
  }

  function endGameFromFakeHeart() {
    trustedUrlScoresRef.current = new Set([0, urlScore]);
    dispatch(recordFakeHeartClick());
    void setUrlScore(0, { history: "replace" });
  }

  const scoreStatus = (
    <div
      aria-live="polite"
      className="pixel-chip px-3 py-2 text-center text-[11px] leading-tight sm:text-xs"
    >
      {cheated ? (
        <p className="font-black uppercase text-red-200">
          You cheated in the game
        </p>
      ) : gameOver ? (
        <p className="font-black uppercase text-red-200">Game over</p>
      ) : (
        <div className="grid gap-0.5">
          <p className="font-black uppercase text-lime-200">Score {score}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {scoreHeaderSlot ? createPortal(scoreStatus, scoreHeaderSlot) : null}

      {fakeHearts.map((fakeHeart, index) => (
        <motion.button
          animate={{
            opacity: [0.55, 0.9, 0.55],
          }}
          aria-label="Fake heart game over"
          className="absolute z-10 inline-flex size-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center text-red-400/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          initial={{ opacity: 0, scale: 0.45 }}
          key={fakeHeart.id}
          onClick={endGameFromFakeHeart}
          style={fakeHeart.style}
          transition={{
            delay: index * 0.08,
            duration: 1.5 + index * 0.12,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          type="button"
        >
          <IoMdHeart aria-hidden className="size-16" />
        </motion.button>
      ))}

      <ViewTransition name="IoMdHeart">
        <button
          aria-label={ariaLabel}
          className={`absolute z-20 inline-flex size-24 cursor-pointer items-center justify-center text-red-300 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${className}`}
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
