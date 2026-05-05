"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

type RobotId = "bolt" | "chip" | "byte" | "nix" | "pixel";

type Point = {
  x: number;
  y: number;
};

type Robot = {
  id: RobotId;
  name: string;
  accentClassName: string;
};

type RobotPositions = Record<RobotId, Point>;

type RobotMotion = {
  vx: number;
  vy: number;
  changeAt: number;
  pauseUntil: number;
};

type RobotMotions = Record<RobotId, RobotMotion>;

type DragState = {
  id: RobotId;
  offsetX: number;
  offsetY: number;
};

type TargetArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const ROBOT_SIZE = 48;
const TARGET_WIDTH = 15;
const TARGET_HEIGHT = 17;

const robots: Robot[] = [
  {
    id: "bolt",
    name: "Bolt",
    accentClassName: "bg-cyan-300",
  },
  {
    id: "chip",
    name: "Chip",
    accentClassName: "bg-lime-300",
  },
  {
    id: "byte",
    name: "Byte",
    accentClassName: "bg-fuchsia-300",
  },
  {
    id: "nix",
    name: "Nix",
    accentClassName: "bg-amber-300",
  },
  {
    id: "pixel",
    name: "Pixel",
    accentClassName: "bg-sky-300",
  },
];

function getNow() {
  return typeof performance === "undefined" ? 0 : performance.now();
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createEmptyPositions(): RobotPositions {
  return {
    bolt: { x: 0, y: 0 },
    chip: { x: 0, y: 0 },
    byte: { x: 0, y: 0 },
    nix: { x: 0, y: 0 },
    pixel: { x: 0, y: 0 },
  };
}

function createEmptyMotions(): RobotMotions {
  return {
    bolt: { vx: 0, vy: 0, changeAt: 0, pauseUntil: 0 },
    chip: { vx: 0, vy: 0, changeAt: 0, pauseUntil: 0 },
    byte: { vx: 0, vy: 0, changeAt: 0, pauseUntil: 0 },
    nix: { vx: 0, vy: 0, changeAt: 0, pauseUntil: 0 },
    pixel: { vx: 0, vy: 0, changeAt: 0, pauseUntil: 0 },
  };
}

function createRobotPositions() {
  return robots.reduce<RobotPositions>((positions, robot) => {
    positions[robot.id] = {
      x: randomBetween(8, 82),
      y: randomBetween(12, 78),
    };

    return positions;
  }, createEmptyPositions());
}

function createRobotMotion(now: number): RobotMotion {
  if (Math.random() < 0.24) {
    const pauseUntil = now + randomBetween(450, 1250);

    return {
      vx: 0,
      vy: 0,
      changeAt: pauseUntil,
      pauseUntil,
    };
  }

  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(2.8, 6.4);

  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    changeAt: now + randomBetween(900, 2800),
    pauseUntil: 0,
  };
}

function createRobotMotions(now: number) {
  return robots.reduce<RobotMotions>((motions, robot) => {
    motions[robot.id] = createRobotMotion(now + randomBetween(0, 700));

    return motions;
  }, createEmptyMotions());
}

function createTargetArea(): TargetArea {
  return {
    x: randomBetween(0, 100 - TARGET_WIDTH),
    y: randomBetween(0, 100 - TARGET_HEIGHT),
    width: TARGET_WIDTH,
    height: TARGET_HEIGHT,
  };
}

function isInsideTarget(point: Point, target: TargetArea) {
  return (
    point.x >= target.x &&
    point.x <= target.x + target.width &&
    point.y >= target.y &&
    point.y <= target.y + target.height
  );
}

function PixelRobot({
  accentClassName,
  isDragging,
  name,
}: {
  accentClassName: string;
  isDragging: boolean;
  name: string;
}) {
  return (
    <div
      aria-label={`${name} robot`}
      className={[
        "relative h-12 w-12 select-none",
        isDragging ? "scale-110" : "scale-100",
      ].join(" ")}
    >
      <div className="absolute left-1/2 top-0 h-2 w-5 -translate-x-1/2 bg-zinc-200" />
      <div className="absolute left-1/2 top-1 h-2 w-2 -translate-x-1/2 bg-red-400" />
      <div className="absolute left-1 top-3 h-7 w-10 border-4 border-zinc-100 bg-zinc-700">
        <div className="absolute left-2 top-2 h-2 w-2 bg-black" />
        <div className="absolute right-2 top-2 h-2 w-2 bg-black" />
        <div className="absolute bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 bg-zinc-200" />
      </div>
      <div className={`absolute left-0 top-5 h-4 w-2 ${accentClassName}`} />
      <div className={`absolute right-0 top-5 h-4 w-2 ${accentClassName}`} />
      <div className={`absolute bottom-0 left-3 h-2 w-2 ${accentClassName}`} />
      <div className={`absolute bottom-0 right-3 h-2 w-2 ${accentClassName}`} />
    </div>
  );
}

export default function RobotDragGame() {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const capturedElementRef = useRef<HTMLDivElement | null>(null);
  const isWinRef = useRef(false);
  const motionsRef = useRef<RobotMotions>(createRobotMotions(getNow()));
  const [positions, setPositions] = useState<RobotPositions>(createRobotPositions);
  const [targetArea, setTargetArea] = useState<TargetArea>(createTargetArea);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isWin, setIsWin] = useState(false);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    isWinRef.current = isWin;
  }, [isWin]);

  useEffect(() => {
    let animationFrame = 0;
    let previousTime = getNow();

    function animate(now: number) {
      const delta = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;

      if (!isWinRef.current) {
        const gameArea = gameAreaRef.current;

        if (gameArea) {
          const rect = gameArea.getBoundingClientRect();
          const maxX = Math.max(0, 100 - (ROBOT_SIZE / rect.width) * 100);
          const maxY = Math.max(0, 100 - (ROBOT_SIZE / rect.height) * 100);
          const draggedId = dragStateRef.current?.id;

          setPositions((currentPositions) => {
            let didMove = false;
            const nextPositions: RobotPositions = { ...currentPositions };

            robots.forEach((robot) => {
              if (robot.id === draggedId) {
                return;
              }

              let motion = motionsRef.current[robot.id];

              if (now < motion.pauseUntil) {
                return;
              }

              if (now >= motion.changeAt) {
                motion = createRobotMotion(now);
                motionsRef.current[robot.id] = motion;

                if (now < motion.pauseUntil) {
                  return;
                }
              }

              const currentPosition = currentPositions[robot.id];
              const nextX = currentPosition.x + motion.vx * delta;
              const nextY = currentPosition.y + motion.vy * delta;
              const clampedX = clamp(nextX, 0, maxX);
              const clampedY = clamp(nextY, 0, maxY);

              if (clampedX !== nextX) {
                motionsRef.current[robot.id] = {
                  ...motion,
                  vx: -motion.vx,
                  changeAt: now + randomBetween(700, 1800),
                };
              }

              if (clampedY !== nextY) {
                motionsRef.current[robot.id] = {
                  ...motionsRef.current[robot.id],
                  vy: -motionsRef.current[robot.id].vy,
                  changeAt: now + randomBetween(700, 1800),
                };
              }

              if (clampedX !== currentPosition.x || clampedY !== currentPosition.y) {
                nextPositions[robot.id] = {
                  x: clampedX,
                  y: clampedY,
                };
                didMove = true;
              }
            });

            return didMove ? nextPositions : currentPositions;
          });
        }
      }

      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  function getPositionFromPointer(event: PointerEvent<HTMLDivElement>, drag: DragState) {
    const gameArea = gameAreaRef.current;

    if (!gameArea) {
      return null;
    }

    const rect = gameArea.getBoundingClientRect();
    const maxX = Math.max(rect.width - ROBOT_SIZE, 0);
    const maxY = Math.max(rect.height - ROBOT_SIZE, 0);
    const nextX = clamp(event.clientX - rect.left - drag.offsetX, 0, maxX);
    const nextY = clamp(event.clientY - rect.top - drag.offsetY, 0, maxY);

    return {
      x: (nextX / rect.width) * 100,
      y: (nextY / rect.height) * 100,
    };
  }

  function handlePointerDown(id: RobotId, event: PointerEvent<HTMLDivElement>) {
    const gameArea = gameAreaRef.current;

    if (!gameArea || isWin) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    capturedElementRef.current = event.currentTarget;

    const rect = gameArea.getBoundingClientRect();
    const currentPosition = positions[id];

    setDragState({
      id,
      offsetX: event.clientX - rect.left - (currentPosition.x / 100) * rect.width,
      offsetY: event.clientY - rect.top - (currentPosition.y / 100) * rect.height,
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragState || isWin) {
      return;
    }

    const nextPosition = getPositionFromPointer(event, dragState);

    if (!nextPosition) {
      return;
    }

    setPositions((currentPositions) => ({
      ...currentPositions,
      [dragState.id]: nextPosition,
    }));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragState) {
      return;
    }

    const finalPosition = getPositionFromPointer(event, dragState);
    const capturedElement = capturedElementRef.current;

    if (capturedElement?.hasPointerCapture(event.pointerId)) {
      capturedElement.releasePointerCapture(event.pointerId);
    }

    capturedElementRef.current = null;
    setDragState(null);

    if (!finalPosition) {
      return;
    }

    setPositions((currentPositions) => ({
      ...currentPositions,
      [dragState.id]: finalPosition,
    }));

    const gameArea = gameAreaRef.current;

    if (!gameArea) {
      return;
    }

    const rect = gameArea.getBoundingClientRect();
    const centerPoint = {
      x: finalPosition.x + (ROBOT_SIZE / 2 / rect.width) * 100,
      y: finalPosition.y + (ROBOT_SIZE / 2 / rect.height) * 100,
    };

    if (isInsideTarget(centerPoint, targetArea)) {
      setIsWin(true);
    }
  }

  function restartGame() {
    const now = getNow();

    capturedElementRef.current = null;
    dragStateRef.current = null;
    isWinRef.current = false;
    motionsRef.current = createRobotMotions(now);

    setDragState(null);
    setIsWin(false);
    setPositions(createRobotPositions());
    setTargetArea(createTargetArea());
  }

  return (
    <main
      ref={gameAreaRef}
      className="fixed inset-0 z-50 overflow-hidden bg-black text-white touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {robots.map((robot) => {
        const position = positions[robot.id];
        const isDragging = dragState?.id === robot.id;

        return (
          <div
            key={robot.id}
            className={[
              "absolute cursor-grab touch-none transition-transform duration-100 active:cursor-grabbing",
              isDragging ? "z-20" : "z-10",
            ].join(" ")}
            onPointerDown={(event) => handlePointerDown(robot.id, event)}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
          >
            <PixelRobot
              accentClassName={robot.accentClassName}
              isDragging={isDragging}
              name={robot.name}
            />
          </div>
        );
      })}

      {isWin ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
          <button
            className="border-4 border-white bg-black px-8 py-5 font-mono text-5xl font-bold tracking-normal text-white shadow-[8px_8px_0_#22c55e]"
            onClick={restartGame}
            type="button"
          >
            You Win!
          </button>
        </div>
      ) : null}
    </main>
  );
}
