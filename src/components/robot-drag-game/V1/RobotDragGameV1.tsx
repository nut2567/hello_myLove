"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

import { PixelRobot } from "@/components/robot-drag-game/V1/PixelRobot";
import { PixelFireworks } from "@/components/ui/pixel-fireworks";

type RobotId = "bolt" | "chip" | "byte" | "nix" | "pixel";
type Difficulty = "easy" | "medium" | "hard";

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
type RobotMovement = Record<RobotId, boolean>;
type RobotSpeech = Record<RobotId, boolean>;

type SpeechSchedule = {
  nextAt: number;
  visibleUntil: number;
};

type SpeechSchedules = Record<RobotId, SpeechSchedule>;

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
const EVASIVE_ROBOT_IDS = new Set<RobotId>(["pixel"]);
const EVASION_RADIUS = 132;
const EVASION_SPEED = 12.5;
const HARD_CATCHABLE_DURATION = 5000;
const SPEECH_TEXT = "Drag me somewhere... maybe something will happen!";

const difficulties: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

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

function getFlashConfig(difficulty: Difficulty) {
  if (difficulty === "easy") {
    return {
      durationMin: 420,
      durationMax: 760,
      intervalMin: 2200,
      intervalMax: 4200,
    };
  }

  if (difficulty === "medium") {
    return {
      durationMin: 320,
      durationMax: 620,
      intervalMin: 6200,
      intervalMax: 10500,
    };
  }

  return null;
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

function createEmptyMovement(): RobotMovement {
  return {
    bolt: false,
    chip: false,
    byte: false,
    nix: false,
    pixel: false,
  };
}

function createEmptySpeech(): RobotSpeech {
  return {
    bolt: false,
    chip: false,
    byte: false,
    nix: false,
    pixel: false,
  };
}

function createEmptySpeechSchedules(): SpeechSchedules {
  return {
    bolt: { nextAt: 0, visibleUntil: 0 },
    chip: { nextAt: 0, visibleUntil: 0 },
    byte: { nextAt: 0, visibleUntil: 0 },
    nix: { nextAt: 0, visibleUntil: 0 },
    pixel: { nextAt: 0, visibleUntil: 0 },
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

function createSpeechSchedules(now: number) {
  return robots.reduce<SpeechSchedules>((schedules, robot) => {
    schedules[robot.id] = {
      nextAt: now + randomBetween(900, 4200),
      visibleUntil: 0,
    };

    return schedules;
  }, createEmptySpeechSchedules());
}

function createTargetArea(): TargetArea {
  return {
    x: randomBetween(0, 100 - TARGET_WIDTH),
    y: randomBetween(0, 100 - TARGET_HEIGHT),
    width: TARGET_WIDTH,
    height: TARGET_HEIGHT,
  };
}

function createHardCatchableId(previousId: RobotId | null = null): RobotId {
  const availableRobots = robots.filter((robot) => robot.id !== previousId);
  const nextRobot =
    availableRobots[Math.floor(Math.random() * availableRobots.length)] ??
    robots[0];

  return nextRobot.id;
}

function createNextFlashAt(difficulty: Difficulty, now: number) {
  const config = getFlashConfig(difficulty);

  if (!config) {
    return Number.POSITIVE_INFINITY;
  }

  return now + randomBetween(config.intervalMin, config.intervalMax);
}

function isInsideTarget(point: Point, target: TargetArea) {
  return (
    point.x >= target.x &&
    point.x <= target.x + target.width &&
    point.y >= target.y &&
    point.y <= target.y + target.height
  );
}

function isRobotEvasive(
  id: RobotId,
  difficulty: Difficulty,
  hardCatchableId: RobotId | null,
) {
  if (difficulty === "hard") {
    return id !== hardCatchableId;
  }

  return EVASIVE_ROBOT_IDS.has(id);
}

function canDragRobot(
  id: RobotId,
  difficulty: Difficulty,
  hardCatchableId: RobotId | null,
) {
  if (difficulty === "hard") {
    return id === hardCatchableId;
  }

  return !EVASIVE_ROBOT_IDS.has(id);
}

export default function RobotDragGameV1() {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const capturedElementRef = useRef<HTMLDivElement | null>(null);
  const pointerPositionRef = useRef<Point | null>(null);
  const hardCatchableRef = useRef<{
    expiresAt: number;
    id: RobotId | null;
  }>({
    expiresAt: 0,
    id: null,
  });
  const isWinRef = useRef(false);
  const difficultyRef = useRef<Difficulty>("easy");
  const isTargetFlashingRef = useRef(false);
  const targetFlashRef = useRef({
    nextAt: createNextFlashAt("easy", getNow()),
    visibleUntil: 0,
  });
  const motionsRef = useRef<RobotMotions>(createRobotMotions(getNow()));
  const robotMovementRef = useRef<RobotMovement>(createEmptyMovement());
  const speechSchedulesRef = useRef<SpeechSchedules>(
    createSpeechSchedules(getNow()),
  );
  const speechVisibleRef = useRef<RobotSpeech>(createEmptySpeech());
  const [positions, setPositions] =
    useState<RobotPositions>(createRobotPositions);
  const [targetArea, setTargetArea] = useState<TargetArea>(createTargetArea);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isWin, setIsWin] = useState(false);
  const [isTargetFlashing, setIsTargetFlashing] = useState(false);
  const [hardCatchableId, setHardCatchableId] = useState<RobotId | null>(null);
  const [robotMovement, setRobotMovement] =
    useState<RobotMovement>(createEmptyMovement);
  const [speechVisible, setSpeechVisible] =
    useState<RobotSpeech>(createEmptySpeech);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

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
        const currentDifficulty = difficultyRef.current;
        const draggedId = dragStateRef.current?.id;

        if (
          currentDifficulty === "hard" &&
          now >= hardCatchableRef.current.expiresAt &&
          !draggedId
        ) {
          const nextHardCatchableId = createHardCatchableId(
            hardCatchableRef.current.id,
          );

          hardCatchableRef.current = {
            expiresAt: now + HARD_CATCHABLE_DURATION,
            id: nextHardCatchableId,
          };
          setHardCatchableId(nextHardCatchableId);
          setTargetArea(createTargetArea());

          if (!isTargetFlashingRef.current) {
            isTargetFlashingRef.current = true;
            setIsTargetFlashing(true);
          }
        }

        if (gameArea) {
          const rect = gameArea.getBoundingClientRect();
          const maxX = Math.max(0, 100 - (ROBOT_SIZE / rect.width) * 100);
          const maxY = Math.max(0, 100 - (ROBOT_SIZE / rect.height) * 100);
          const nextSpeech = createEmptySpeech();
          let speechChanged = false;

          robots.forEach((robot) => {
            if (robot.id === draggedId) {
              return;
            }

            let motion = motionsRef.current[robot.id];

            if (now >= motion.changeAt) {
              motion = createRobotMotion(now);
              motionsRef.current[robot.id] = motion;
            }

            if (now < motion.pauseUntil) {
              return;
            }

            const isWalking = motion.vx !== 0 || motion.vy !== 0;
            const speechSchedule = speechSchedulesRef.current[robot.id];

            if (isWalking && now >= speechSchedule.nextAt) {
              const visibleUntil = now + randomBetween(1700, 3200);

              speechSchedulesRef.current[robot.id] = {
                nextAt: visibleUntil + randomBetween(5000, 29000),
                visibleUntil,
              };
            }

            nextSpeech[robot.id] =
              isWalking &&
              now < speechSchedulesRef.current[robot.id].visibleUntil;
          });

          robots.forEach((robot) => {
            if (speechVisibleRef.current[robot.id] !== nextSpeech[robot.id]) {
              speechChanged = true;
            }
          });

          if (speechChanged) {
            speechVisibleRef.current = nextSpeech;
            setSpeechVisible(nextSpeech);
          }

          setPositions((currentPositions) => {
            let didMove = false;
            let movementChanged = false;
            const nextMovement = createEmptyMovement();
            const nextPositions: RobotPositions = { ...currentPositions };

            robots.forEach((robot) => {
              if (robot.id === draggedId) {
                if (robotMovementRef.current[robot.id]) {
                  movementChanged = true;
                }
                return;
              }

              const motion = motionsRef.current[robot.id];

              if (now < motion.pauseUntil) {
                if (robotMovementRef.current[robot.id]) {
                  movementChanged = true;
                }
                return;
              }

              const currentPosition = currentPositions[robot.id];
              let nextX = currentPosition.x + motion.vx * delta;
              let nextY = currentPosition.y + motion.vy * delta;

              if (
                isRobotEvasive(
                  robot.id,
                  currentDifficulty,
                  hardCatchableRef.current.id,
                )
              ) {
                const pointerPosition = pointerPositionRef.current;

                if (pointerPosition) {
                  const robotCenterX =
                    (currentPosition.x / 100) * rect.width + ROBOT_SIZE / 2;
                  const robotCenterY =
                    (currentPosition.y / 100) * rect.height + ROBOT_SIZE / 2;
                  const pointerX = (pointerPosition.x / 100) * rect.width;
                  const pointerY = (pointerPosition.y / 100) * rect.height;
                  const distanceX = robotCenterX - pointerX;
                  const distanceY = robotCenterY - pointerY;
                  const distance = Math.hypot(distanceX, distanceY);

                  if (distance > 0 && distance < EVASION_RADIUS) {
                    const pressure = 1 - distance / EVASION_RADIUS;
                    const escapeSpeed = EVASION_SPEED * pressure;
                    const escapeX = (distanceX / distance) * escapeSpeed;
                    const escapeY = (distanceY / distance) * escapeSpeed;

                    nextX += escapeX * delta;
                    nextY += escapeY * delta;
                    motionsRef.current[robot.id] = {
                      vx: escapeX,
                      vy: escapeY,
                      changeAt: now + randomBetween(240, 620),
                      pauseUntil: 0,
                    };
                  }
                }
              }

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

              if (
                clampedX !== currentPosition.x ||
                clampedY !== currentPosition.y
              ) {
                nextMovement[robot.id] = true;
                nextPositions[robot.id] = {
                  x: clampedX,
                  y: clampedY,
                };
                didMove = true;
              }

              if (robotMovementRef.current[robot.id] !== nextMovement[robot.id]) {
                movementChanged = true;
              }
            });

            if (movementChanged) {
              robotMovementRef.current = nextMovement;
              setRobotMovement(nextMovement);
            }

            return didMove ? nextPositions : currentPositions;
          });
        }

        if (currentDifficulty === "hard") {
          const shouldShowHardTarget =
            hardCatchableRef.current.id !== null &&
            now < hardCatchableRef.current.expiresAt;

          if (isTargetFlashingRef.current !== shouldShowHardTarget) {
            isTargetFlashingRef.current = shouldShowHardTarget;
            setIsTargetFlashing(shouldShowHardTarget);
          }
        }

        const flashConfig =
          currentDifficulty === "hard"
            ? null
            : getFlashConfig(currentDifficulty);

        if (currentDifficulty !== "hard" && !flashConfig) {
          if (targetFlashRef.current.visibleUntil !== 0) {
            targetFlashRef.current.visibleUntil = 0;
            isTargetFlashingRef.current = false;
            setIsTargetFlashing(false);
          }
        } else if (flashConfig && now >= targetFlashRef.current.visibleUntil) {
          if (isTargetFlashingRef.current) {
            isTargetFlashingRef.current = false;
            setIsTargetFlashing(false);
          }

          if (now >= targetFlashRef.current.nextAt) {
            const visibleUntil =
              now +
              randomBetween(flashConfig.durationMin, flashConfig.durationMax);

            if (currentDifficulty === "medium") {
              setTargetArea(createTargetArea());
            }

            targetFlashRef.current = {
              nextAt:
                visibleUntil +
                randomBetween(flashConfig.intervalMin, flashConfig.intervalMax),
              visibleUntil,
            };
            isTargetFlashingRef.current = true;
            setIsTargetFlashing(true);
          }
        }
      }

      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  function getPositionFromPointer(
    event: PointerEvent<HTMLDivElement>,
    drag: DragState,
  ) {
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

    if (!canDragRobot(id, difficultyRef.current, hardCatchableRef.current.id)) {
      const motion = createRobotMotion(getNow());

      motionsRef.current[id] = {
        vx: motion.vx * 1.8,
        vy: motion.vy * 1.8,
        changeAt: getNow() + randomBetween(380, 760),
        pauseUntil: 0,
      };
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    capturedElementRef.current = event.currentTarget;

    const rect = gameArea.getBoundingClientRect();
    const currentPosition = positions[id];

    setDragState({
      id,
      offsetX:
        event.clientX - rect.left - (currentPosition.x / 100) * rect.width,
      offsetY:
        event.clientY - rect.top - (currentPosition.y / 100) * rect.height,
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const gameArea = gameAreaRef.current;

    if (gameArea) {
      const rect = gameArea.getBoundingClientRect();

      pointerPositionRef.current = {
        x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
        y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
      };
    }

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

  function handlePointerLeave() {
    if (!dragStateRef.current) {
      pointerPositionRef.current = null;
    }
  }

  function restartGame(nextDifficulty = difficultyRef.current) {
    const now = getNow();

    capturedElementRef.current = null;
    dragStateRef.current = null;
    pointerPositionRef.current = null;
    const nextHardCatchableId =
      nextDifficulty === "hard" ? createHardCatchableId() : null;
    isWinRef.current = false;
    difficultyRef.current = nextDifficulty;
    isTargetFlashingRef.current = nextDifficulty === "hard";
    hardCatchableRef.current = {
      expiresAt: nextDifficulty === "hard" ? now + HARD_CATCHABLE_DURATION : 0,
      id: nextHardCatchableId,
    };
    motionsRef.current = createRobotMotions(now);
    robotMovementRef.current = createEmptyMovement();
    speechSchedulesRef.current = createSpeechSchedules(now);
    speechVisibleRef.current = createEmptySpeech();
    targetFlashRef.current = {
      nextAt: createNextFlashAt(nextDifficulty, now),
      visibleUntil: 0,
    };

    setDifficulty(nextDifficulty);
    setDragState(null);
    setIsWin(false);
    setIsTargetFlashing(nextDifficulty === "hard");
    setHardCatchableId(nextHardCatchableId);
    setRobotMovement(createEmptyMovement());
    setSpeechVisible(createEmptySpeech());
    setPositions(createRobotPositions());
    setTargetArea(createTargetArea());
  }

  function handleDifficultyChange(nextDifficulty: Difficulty) {
    restartGame(nextDifficulty);
  }

  const shouldDisplayTargetArea = isTargetFlashing && difficulty !== "hard";

  return (
    <main
      ref={gameAreaRef}
      className="fixed inset-0 z-50 overflow bg-black text-white touch-none"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 gap-2 border-4 border-white bg-black p-1 font-mono shadow-[6px_6px_0_#374151]">
        {difficulties.map((difficultyOption) => (
          <button
            key={difficultyOption.id}
            className={[
              "px-3 py-2 text-sm font-bold text-white",
              difficulty === difficultyOption.id
                ? "bg-emerald-400 text-black"
                : "bg-zinc-900 hover:bg-zinc-700",
            ].join(" ")}
            onClick={() => handleDifficultyChange(difficultyOption.id)}
            type="button"
          >
            {difficultyOption.label}
          </button>
        ))}
      </div>

      {shouldDisplayTargetArea ? (
        <div
          className="pointer-events-none absolute z-0 border-4 border-dashed border-emerald-200/35 bg-emerald-300/5 shadow-[0_0_24px_rgba(110,231,183,0.18)]"
          style={{
            height: `${targetArea.height}%`,
            left: `${targetArea.x}%`,
            top: `${targetArea.y}%`,
            width: `${targetArea.width}%`,
          }}
        />
      ) : null}

      {robots.map((robot) => {
        const position = positions[robot.id];
        const isDragging = dragState?.id === robot.id;
        const isDraggable = canDragRobot(robot.id, difficulty, hardCatchableId);
        const isWalking = !isDraggable || robotMovement[robot.id];
        const showSpeech = speechVisible[robot.id] && !isDragging && !isWin;

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
            {showSpeech ? (
              <div className="absolute bottom-full left-1/2 mb-3 w-48 -translate-x-1/2 border-4 border-white bg-black px-3 py-2 font-mono text-[10px] leading-snug text-white shadow-[4px_4px_0_#374151]">
                {SPEECH_TEXT}
                <div className="absolute -bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 border-b-4 border-r-4 border-white bg-black" />
              </div>
            ) : null}
            <PixelRobot
              accentClassName={robot.accentClassName}
              isDragging={isDragging}
              isMoving={isWalking && !isDragging}
              name={robot.name}
            />
          </div>
        );
      })}

      {isWin ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-black/60">
          <PixelFireworks active={isWin} anchorCount={8} />
          <button
            className="relative z-10 border-4 border-white bg-black px-8 py-5 font-mono text-5xl font-bold tracking-normal text-white shadow-[8px_8px_0_#22c55e]"
            onClick={() => restartGame()}
            type="button"
          >
            You Win!
          </button>
        </div>
      ) : null}
    </main>
  );
}
