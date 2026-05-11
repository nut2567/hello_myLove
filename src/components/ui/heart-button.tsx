"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { motion, useAnimationControls } from "framer-motion";
import { IoMdHeart } from "react-icons/io";
import { parseAsInteger, useQueryState } from "nuqs";

import {
  useHeartGameDispatch,
  useHeartGameSelector,
} from "@/lib/heart-game-hooks";
import { markCheated, recordHeartClick } from "@/lib/heart-game-store";
import { createHeartRoute } from "@/lib/heart-id";

type HeartButtonProps = {
  "aria-label": string;
  className?: string;
  nextHeartId: number;
  style?: CSSProperties;
};

const HEART_SCORE_HEADER_SLOT_ID = "heart-score-header-slot";

function getHeartScoreHeaderSlot() {
  return document.getElementById(HEART_SCORE_HEADER_SLOT_ID);
}

function subscribeToHeartScoreHeaderSlot(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}

function createExitDrift() {
  return {
    rotate: Math.random() > 0.5 ? 16 : -16,
    x: Math.round((Math.random() - 0.5) * 88),
    y: Math.round((Math.random() - 0.5) * 88),
  };
}

export function HeartButton({
  "aria-label": ariaLabel,
  className = "",
  nextHeartId,
  style,
}: HeartButtonProps) {
  const router = useRouter();
  const controls = useAnimationControls();
  const dispatch = useHeartGameDispatch();
  const score = useHeartGameSelector((state) => state.heartGame.score);
  const cheated = useHeartGameSelector((state) => state.heartGame.cheated);
  const [isMoving, setIsMoving] = useState(false);
  const [urlScore, setUrlScore] = useQueryState(
    "score",
    parseAsInteger.withDefault(0),
  );
  const scoreHeaderSlot = useSyncExternalStore(
    subscribeToHeartScoreHeaderSlot,
    getHeartScoreHeaderSlot,
    () => null,
  );
  const isMovingRef = useRef(false);
  const trustedUrlScoresRef = useRef<Set<number>>(new Set([0]));

  useEffect(() => {
    void controls.start({
      filter: "blur(0px)",
      opacity: 1,
      rotate: 0,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.34,
        ease: [0.16, 1, 0.3, 1],
      },
    });
  }, [controls, nextHeartId]);

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

  async function goToRandomHeart() {
    if (isMovingRef.current) {
      return;
    }

    isMovingRef.current = true;
    setIsMoving(true);

    const nextScore = score + 1;
    const previousTrustedScores = trustedUrlScoresRef.current;
    const exitDrift = createExitDrift();

    trustedUrlScoresRef.current = new Set([
      ...previousTrustedScores,
      nextScore,
    ]);
    dispatch(recordHeartClick());
    void setUrlScore(nextScore, { history: "replace" });

    try {
      await controls.start({
        filter: "blur(4px)",
        opacity: 0,
        rotate: exitDrift.rotate,
        scale: 0.25,
        x: exitDrift.x,
        y: exitDrift.y,
        transition: {
          duration: 0.22,
          ease: [0.7, 0, 0.84, 0],
        },
      });
      router.push(createHeartRoute(nextHeartId, nextScore), { scroll: false });
    } catch {
      isMovingRef.current = false;
      setIsMoving(false);
    }
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

      <motion.button
        animate={controls}
        aria-label={ariaLabel}
        className={`inline-flex size-24 cursor-pointer items-center justify-center text-red-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:pointer-events-none ${className}`}
        disabled={isMoving}
        initial={{
          filter: "blur(4px)",
          opacity: 0,
          rotate: -10,
          scale: 0.45,
          x: -20,
          y: 16,
        }}
        onClick={() => {
          void goToRandomHeart();
        }}
        style={style}
        type="button"
        whileHover={{ scale: isMoving ? 1 : 1.12 }}
        whileTap={{ scale: 0.9 }}
      >
        <IoMdHeart aria-hidden className="size-20" />
      </motion.button>
    </>
  );
}
