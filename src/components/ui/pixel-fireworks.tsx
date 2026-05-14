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
};

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
  return Array.from({ length: count }, (_, index) => {
    let left = randomBetween(9, 91);
    let top = randomBetween(10, 90);

    for (let attempt = 0; attempt < 12; attempt += 1) {
      if (!isInsideCenterPopupArea(left, top)) {
        break;
      }

      left = randomBetween(9, 91);
      top = randomBetween(10, 90);
    }

    return {
      bits: createFireworkBits(bitsPerFirework, index),
      centerColor: randomItem(FIREWORK_COLORS),
      centerSize: randomInteger(8, 14),
      delay: index * 0.24 + randomBetween(0, 0.36),
      id: `pixel-firework-${index}-${Math.round(left * 10)}-${Math.round(
        top * 10,
      )}`,
      left: `${Math.round(left)}%`,
      scale: randomBetween(minScale, maxScale),
      top: `${Math.round(top)}%`,
    };
  });
}

function createFireworkBits(count: number, anchorIndex: number): FireworkBit[] {
  const randomizedCount = randomInteger(
    Math.max(8, Math.floor(count * 0.75)),
    Math.max(9, Math.ceil(count * 1.25)),
  );
  const angleOffset = randomBetween(0, Math.PI * 2);

  return Array.from({ length: randomizedCount }, (_, index) => {
    const angle =
      angleOffset +
      (index / randomizedCount) * Math.PI * 2 +
      randomBetween(-0.18, 0.18);
    const distance = randomBetween(36, 94);
    const size = randomInteger(4, 10);

    return {
      color: randomItem(FIREWORK_COLORS),
      id: `pixel-firework-bit-${anchorIndex}-${index}`,
      size,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
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
}: PixelFireworksProps) {
  const [anchors, setAnchors] = useState<FireworkAnchor[]>([]);

  useEffect(() => {
    if (!active) {
      return;
    }

    let mounted = true;

    queueMicrotask(() => {
      if (!mounted) {
        return;
      }

      setAnchors(
        createFireworkAnchors(
          anchorCount,
          bitsPerFirework,
          minScale,
          maxScale,
        ),
      );
    });

    return () => {
      mounted = false;
    };
  }, [active, anchorCount, bitsPerFirework, maxScale, minScale]);

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
                delay: anchor.delay,
                duration: 1.8,
                ease: "easeInOut",
                repeat: Infinity,
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
                  delay: anchor.delay,
                  duration: 1.8,
                  ease: "easeOut",
                  repeat: Infinity,
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
                    delay: anchor.delay + bitIndex * 0.012,
                    duration: 1.8,
                    ease: [0.16, 1, 0.3, 1],
                    repeat: Infinity,
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
