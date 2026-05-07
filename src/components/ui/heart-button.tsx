"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type CSSProperties, ViewTransition } from "react";
import { IoMdHeart } from "react-icons/io";

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

export function HeartButton({
  "aria-label": ariaLabel,
  className = "",
  style,
}: HeartButtonProps) {
  const router = useRouter();

  function goToRandomHeart() {
    router.push(`/th/heart/${generateHeartId()}` as Route);
  }

  return (
    <ViewTransition name="IoMdHeart">
      <button
        aria-label={ariaLabel}
        className={`cursor-pointer inline-flex size-24 items-center justify-center text-red-300 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${className}`}
        onClick={goToRandomHeart}
        style={style}
        type="button"
      >
        <IoMdHeart aria-hidden className="size-20" />
      </button>
    </ViewTransition>
  );
}
