"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type PixelFireworksProps = {
  active: boolean;
  anchorCount?: number;
  bitsPerFirework?: number;
  className?: string;
  maxScale?: number;
  minScale?: number;
  sequenceSize?: number;
};

type FireworkModel = "burst" | "heart";

type FireworkAnchor = {
  bits: FireworkBit[];
  centerColor: string;
  centerSize: number;
  delay: number;
  id: string;
  left: `${number}%`;
  scale: number;
  top: `${number}%`;
};

type FireworkBit = {
  color: string;
  id: string;
  size: number;
  x: number;
  y: number;
};

const FIREWORK_COLORS = [
  "bg-white",
  "bg-cyan-300",
  "bg-lime-300",
  "bg-fuchsia-300",
  "bg-rose-300",
  "bg-amber-200",
  "bg-sky-300",
] as const;
const DEFAULT_SEQUENCE_SIZE = 50;
const FIREWORK_DURATION_S = 1.8;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomInteger(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function isInsideCenterPopupArea(left: number, top: number) {
  return left >= 28 && left <= 72 && top >= 22 && top <= 78;
}

function createFireworkAnchors(
  count: number,
  bitsPerFirework: number,
  minScale: number,
  maxScale: number,
): FireworkAnchor[] {
  const cycleId = randomInteger(1000, 9999);

  return Array.from({ length: count }, (_, index) => {
    let left = randomBetween(9, 91);
    let top = randomBetween(10, 90);
    const model: FireworkModel = Math.random() < 0.45 ? "heart" : "burst";

    for (let attempt = 0; attempt < 12; attempt += 1) {
      if (!isInsideCenterPopupArea(left, top)) {
        break;
      }

      left = randomBetween(9, 91);
      top = randomBetween(10, 90);
    }

    return {
      bits: createFireworkBits(bitsPerFirework, index, model),
      centerColor: randomItem(FIREWORK_COLORS),
      centerSize: randomInteger(8, 14),
      delay: randomBetween(0, 0.12),
      id: `pixel-firework-${cycleId}-${index}-${Math.round(
        left * 10,
      )}-${Math.round(top * 10)}`,
      left: `${Math.round(left)}%`,
      scale: randomBetween(minScale, maxScale),
      top: `${Math.round(top)}%`,
    };
  });
}

function createHeartPoint(index: number, count: number) {
  const t = (index / count) * Math.PI * 2;
  const x = 16 * Math.sin(t) ** 3;
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  const size = randomBetween(3.2, 5.1);

  return {
    x: x * size + randomBetween(-5, 5),
    y: -y * size + randomBetween(-5, 5),
  };
}

function createBurstPoint(index: number, count: number) {
  const angle =
    (index / count) * Math.PI * 2 +
    randomBetween(0, Math.PI * 2) +
    randomBetween(-0.18, 0.18);
  const distance = randomBetween(36, 94);

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
}

function createFireworkBits(
  count: number,
  anchorIndex: number,
  model: FireworkModel,
): FireworkBit[] {
  const randomizedCount = randomInteger(
    Math.max(8, Math.floor(count * 0.75)),
    Math.max(9, Math.ceil(count * 1.25)),
  );

  return Array.from({ length: randomizedCount }, (_, index) => {
    const point =
      model === "heart"
        ? createHeartPoint(index, randomizedCount)
        : createBurstPoint(index, randomizedCount);

    return {
      color: randomItem(FIREWORK_COLORS),
      id: `pixel-firework-bit-${anchorIndex}-${index}`,
      size: randomInteger(4, 10),
      x: point.x,
      y: point.y,
    };
  });
}

export function PixelFireworks({
  active,
  anchorCount = 7,
  bitsPerFirework = 16,
  className = "",
  maxScale = 1.3,
  minScale = 0.8,
  sequenceSize = DEFAULT_SEQUENCE_SIZE,
}: PixelFireworksProps) {
  const [anchors, setAnchors] = useState<FireworkAnchor[]>([]);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setAnchors(
        createFireworkAnchors(
          Math.max(1, Math.round(sequenceSize)),
          bitsPerFirework,
          minScale,
          maxScale,
        ),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [active, bitsPerFirework, maxScale, minScale, sequenceSize]);

  const stepSeconds = FIREWORK_DURATION_S / Math.max(1, anchorCount);
  const sequenceSeconds = Math.max(
    FIREWORK_DURATION_S,
    anchors.length * stepSeconds,
  );
  const repeatDelaySeconds = Math.max(
    0,
    sequenceSeconds - FIREWORK_DURATION_S,
  );

  return (
    <AnimatePresence>
      {active && anchors.length > 0 ? (
        <motion.div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
          exit={{
            opacity: 0,
            transition: { duration: 1.1, ease: "easeOut" },
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {anchors.map((anchor, anchorIndex) => (
            <motion.div
              animate={{ opacity: [0, 1, 1, 0] }}
              className="absolute"
              key={anchor.id}
              style={{
                left: anchor.left,
                top: anchor.top,
              }}
              transition={{
                delay: anchorIndex * stepSeconds + anchor.delay,
                duration: FIREWORK_DURATION_S,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: repeatDelaySeconds,
              }}
            >
              <motion.span
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.7, 1.35 * anchor.scale, 0.45],
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 ${anchor.centerColor}`}
                style={{
                  height: anchor.centerSize,
                  width: anchor.centerSize,
                }}
                transition={{
                  delay: anchorIndex * stepSeconds + anchor.delay,
                  duration: FIREWORK_DURATION_S,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: repeatDelaySeconds,
                }}
              />
              {anchor.bits.map((bit, bitIndex) => (
                <motion.span
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0.2, anchor.scale, anchor.scale * 0.86, 0.35],
                    x: [
                      0,
                      bit.x * anchor.scale,
                      bit.x * anchor.scale * 1.18,
                      bit.x * anchor.scale * 1.26,
                    ],
                    y: [
                      0,
                      bit.y * anchor.scale,
                      bit.y * anchor.scale * 1.18,
                      bit.y * anchor.scale * 1.26,
                    ],
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 ${bit.color}`}
                  key={`${bit.id}-${anchorIndex}-${bitIndex}`}
                  style={{
                    height: bit.size,
                    width: bit.size,
                  }}
                  transition={{
                    delay:
                      anchorIndex * stepSeconds +
                      anchor.delay +
                      bitIndex * 0.012,
                    duration: FIREWORK_DURATION_S,
                    ease: [0.16, 1, 0.3, 1],
                    repeat: Infinity,
                    repeatDelay: repeatDelaySeconds,
                  }}
                />
              ))}
            </motion.div>
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
