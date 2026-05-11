"use client";

import {
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import {
  Canvas,
  type ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Color, Plane, Vector3 } from "three";

import { ArenaFloor } from "@/components/robot-drag-game/V2/ArenaFloor";
import {
  DinosaurModel,
  RobotModel,
  TargetBeacon,
} from "@/components/robot-drag-game/V2/models";
import {
  DINOSAUR_RADIUS,
  HALF_DEPTH,
  HALF_WIDTH,
  ROBOT_COUNT,
  ROBOT_RADIUS,
  difficulties,
  difficultyOrder,
  getDockPoint,
  robotConfigs,
} from "@/components/robot-drag-game/V2/robotConfigs";
import type {
  DinosaurState,
  Difficulty,
  DragSession,
  RobotId,
  RobotMotion,
  RobotMotions,
  RobotStates,
  TargetPoint,
} from "@/components/robot-drag-game/V2/types";

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distance2D(a: TargetPoint, b: TargetPoint) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function getNow() {
  return typeof performance === "undefined" ? 0 : performance.now();
}

function createPoint(margin = 0.9): TargetPoint {
  return {
    x: randomBetween(-HALF_WIDTH + margin, HALF_WIDTH - margin),
    z: randomBetween(-HALF_DEPTH + margin, HALF_DEPTH - margin),
  };
}

function createRobotStates(): RobotStates {
  return robotConfigs.reduce<RobotStates>((states, robot, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);

    states[robot.id] = {
      x: -3.3 + column * 3.2 + randomBetween(-0.2, 0.2),
      z: -1.45 + row * 2.65 + randomBetween(-0.2, 0.2),
      yaw: randomBetween(-Math.PI, Math.PI),
      captured: false,
    };

    return states;
  }, {} as RobotStates);
}

function createDinosaurState(): DinosaurState {
  return {
    x: 3.65,
    z: -2.2,
    yaw: -0.52,
  };
}

function createRobotMotion(now: number, difficulty: Difficulty): RobotMotion {
  if (Math.random() < 0.18) {
    const pauseUntil = now + randomBetween(320, 920);

    return {
      vx: 0,
      vz: 0,
      changeAt: pauseUntil,
      pauseUntil,
    };
  }

  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(0.42, 0.86) * difficulties[difficulty].speed;

  return {
    vx: Math.cos(angle) * speed,
    vz: Math.sin(angle) * speed,
    changeAt: now + randomBetween(850, 2400),
    pauseUntil: 0,
  };
}

function createRobotMotions(now: number, difficulty: Difficulty): RobotMotions {
  return robotConfigs.reduce<RobotMotions>((motions, robot) => {
    motions[robot.id] = createRobotMotion(
      now + randomBetween(0, 600),
      difficulty,
    );

    return motions;
  }, {} as RobotMotions);
}

function createFlashSchedule(now: number, difficulty: Difficulty) {
  const settings = difficulties[difficulty];
  const duration = randomBetween(
    settings.flashDuration[0],
    settings.flashDuration[1],
  );

  return {
    nextAt:
      now + randomBetween(settings.flashInterval[0], settings.flashInterval[1]),
    visibleUntil: settings.alwaysVisible
      ? Number.POSITIVE_INFINITY
      : now + duration,
  };
}

function countCaptured(states: RobotStates) {
  return robotConfigs.reduce(
    (total, robot) => total + (states[robot.id].captured ? 1 : 0),
    0,
  );
}

function RobotArena({
  difficulty,
  dinosaurState,
  draggedId,
  isDinosaurDragging,
  isComplete,
  onCapturedCountChange,
  restartKey,
  robotStates,
  setDinosaurState,
  setDraggedId,
  setIsDinosaurDragging,
  setIsComplete,
  setRobotStates,
  setTarget,
  setTargetVisible,
  target,
  targetVisible,
}: {
  difficulty: Difficulty;
  dinosaurState: DinosaurState;
  draggedId: RobotId | null;
  isDinosaurDragging: boolean;
  isComplete: boolean;
  onCapturedCountChange: (count: number) => void;
  restartKey: number;
  robotStates: RobotStates;
  setDinosaurState: Dispatch<SetStateAction<DinosaurState>>;
  setDraggedId: Dispatch<SetStateAction<RobotId | null>>;
  setIsDinosaurDragging: Dispatch<SetStateAction<boolean>>;
  setIsComplete: Dispatch<SetStateAction<boolean>>;
  setRobotStates: Dispatch<SetStateAction<RobotStates>>;
  setTarget: Dispatch<SetStateAction<TargetPoint>>;
  setTargetVisible: Dispatch<SetStateAction<boolean>>;
  target: TargetPoint;
  targetVisible: boolean;
}) {
  const { camera, pointer, raycaster } = useThree();
  const statesRef = useRef(robotStates);
  const dinosaurStateRef = useRef(dinosaurState);
  const targetRef = useRef(target);
  const difficultyRef = useRef(difficulty);
  const targetVisibleRef = useRef(targetVisible);
  const isCompleteRef = useRef(isComplete);
  const draggedIdRef = useRef(draggedId);
  const dragRef = useRef<DragSession | null>(null);
  const pointerWorldRef = useRef(new Vector3());
  const dragPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), []);
  const motionsRef = useRef<RobotMotions>(
    createRobotMotions(getNow(), difficulty),
  );
  const flashRef = useRef(createFlashSchedule(getNow(), difficulty));

  useEffect(() => {
    statesRef.current = robotStates;
  }, [robotStates]);

  useEffect(() => {
    dinosaurStateRef.current = dinosaurState;
  }, [dinosaurState]);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    targetVisibleRef.current = targetVisible;
  }, [targetVisible]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    draggedIdRef.current = draggedId;
  }, [draggedId]);

  useEffect(() => {
    const now = getNow();

    motionsRef.current = createRobotMotions(now, difficulty);
    flashRef.current = createFlashSchedule(now, difficulty);
    dragRef.current = null;
    setDraggedId(null);
    setIsDinosaurDragging(false);
    setTargetVisible(difficulties[difficulty].alwaysVisible);
  }, [
    difficulty,
    restartKey,
    setDraggedId,
    setIsDinosaurDragging,
    setTargetVisible,
  ]);

  const finishDrag = useCallback(() => {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    dragRef.current = null;
    setDraggedId(null);
    setIsDinosaurDragging(false);

    if (drag.kind === "dinosaur") {
      return;
    }

    const settings = difficulties[difficultyRef.current];
    const currentStates = statesRef.current;
    const currentRobot = currentStates[drag.id];

    if (!currentRobot || currentRobot.captured) {
      return;
    }

    const robotPoint = {
      x: currentRobot.x,
      z: currentRobot.z,
    };

    if (distance2D(robotPoint, targetRef.current) > settings.targetRadius) {
      return;
    }

    const capturedIndex = countCaptured(currentStates);
    const dock = getDockPoint(capturedIndex);
    const nextStates: RobotStates = {
      ...currentStates,
      [drag.id]: {
        ...currentRobot,
        x: dock.x,
        z: dock.z,
        yaw: 0,
        captured: true,
      },
    };
    const nextCapturedCount = capturedIndex + 1;

    statesRef.current = nextStates;
    setRobotStates(nextStates);
    onCapturedCountChange(nextCapturedCount);

    if (nextCapturedCount >= ROBOT_COUNT) {
      isCompleteRef.current = true;
      setIsComplete(true);
      setTargetVisible(true);
      return;
    }

    const nextTarget = createPoint();
    const now = getNow();

    targetRef.current = nextTarget;
    setTarget(nextTarget);
    flashRef.current = createFlashSchedule(now, difficultyRef.current);
    targetVisibleRef.current =
      difficulties[difficultyRef.current].alwaysVisible;
    setTargetVisible(difficulties[difficultyRef.current].alwaysVisible);
  }, [
    onCapturedCountChange,
    setDraggedId,
    setIsDinosaurDragging,
    setIsComplete,
    setRobotStates,
    setTarget,
    setTargetVisible,
  ]);

  useEffect(() => {
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [finishDrag]);

  useFrame((frameState, delta) => {
    if (isCompleteRef.current) {
      return;
    }

    const now = frameState.clock.elapsedTime * 1000;
    const settings = difficulties[difficultyRef.current];
    let nearReveal = false;

    if (dragRef.current) {
      raycaster.setFromCamera(pointer, camera);

      if (raycaster.ray.intersectPlane(dragPlane, pointerWorldRef.current)) {
        const drag = dragRef.current;

        if (drag.kind === "dinosaur") {
          const currentDinosaur = dinosaurStateRef.current;
          const nextX = clamp(
            pointerWorldRef.current.x + drag.offsetX,
            -HALF_WIDTH + DINOSAUR_RADIUS,
            HALF_WIDTH - DINOSAUR_RADIUS,
          );
          const nextZ = clamp(
            pointerWorldRef.current.z + drag.offsetZ,
            -HALF_DEPTH + DINOSAUR_RADIUS,
            HALF_DEPTH - DINOSAUR_RADIUS,
          );
          const nextYaw = Math.atan2(
            nextX - currentDinosaur.x,
            nextZ - currentDinosaur.z,
          );
          const nextDinosaurState: DinosaurState = {
            x: nextX,
            z: nextZ,
            yaw: Number.isFinite(nextYaw) ? nextYaw : currentDinosaur.yaw,
          };

          dinosaurStateRef.current = nextDinosaurState;
          setDinosaurState(nextDinosaurState);
        } else {
          const currentStates = statesRef.current;
          const currentRobot = currentStates[drag.id];

          if (currentRobot && !currentRobot.captured) {
            const nextX = clamp(
              pointerWorldRef.current.x + drag.offsetX,
              -HALF_WIDTH + ROBOT_RADIUS,
              HALF_WIDTH - ROBOT_RADIUS,
            );
            const nextZ = clamp(
              pointerWorldRef.current.z + drag.offsetZ,
              -HALF_DEPTH + ROBOT_RADIUS,
              HALF_DEPTH - ROBOT_RADIUS,
            );
            const nextYaw = Math.atan2(
              nextX - currentRobot.x,
              nextZ - currentRobot.z,
            );
            const nextStates: RobotStates = {
              ...currentStates,
              [drag.id]: {
                ...currentRobot,
                x: nextX,
                z: nextZ,
                yaw: Number.isFinite(nextYaw) ? nextYaw : currentRobot.yaw,
              },
            };

            statesRef.current = nextStates;
            setRobotStates(nextStates);
            nearReveal =
              distance2D({ x: nextX, z: nextZ }, targetRef.current) <
              settings.nearRevealDistance;
          }
        }
      }
    }

    let nextTargetVisible = settings.alwaysVisible || nearReveal;

    if (!settings.alwaysVisible) {
      if (now >= flashRef.current.nextAt) {
        const visibleUntil =
          now +
          randomBetween(settings.flashDuration[0], settings.flashDuration[1]);

        flashRef.current = {
          visibleUntil,
          nextAt:
            visibleUntil +
            randomBetween(settings.flashInterval[0], settings.flashInterval[1]),
        };
      }

      nextTargetVisible =
        nextTargetVisible || now < flashRef.current.visibleUntil;
    }

    if (targetVisibleRef.current !== nextTargetVisible) {
      targetVisibleRef.current = nextTargetVisible;
      setTargetVisible(nextTargetVisible);
    }

    setRobotStates((currentStates) => {
      let didChange = false;
      const nextStates: RobotStates = { ...currentStates };
      const activeDrag =
        dragRef.current?.kind === "robot" ? dragRef.current.id : null;

      robotConfigs.forEach((robot) => {
        const current = currentStates[robot.id];

        if (current.captured || robot.id === activeDrag) {
          return;
        }

        let motion = motionsRef.current[robot.id];

        if (now >= motion.changeAt) {
          motion = createRobotMotion(now, difficultyRef.current);
          motionsRef.current[robot.id] = motion;
        }

        if (now < motion.pauseUntil) {
          return;
        }

        let nextX = current.x + motion.vx * delta;
        let nextZ = current.z + motion.vz * delta;
        const clampedX = clamp(
          nextX,
          -HALF_WIDTH + ROBOT_RADIUS,
          HALF_WIDTH - ROBOT_RADIUS,
        );
        const clampedZ = clamp(
          nextZ,
          -HALF_DEPTH + ROBOT_RADIUS,
          HALF_DEPTH - ROBOT_RADIUS,
        );

        if (clampedX !== nextX) {
          motion = {
            ...motion,
            vx: -motion.vx,
            changeAt: now + randomBetween(500, 1200),
          };
          motionsRef.current[robot.id] = motion;
          nextX = clampedX;
        }

        if (clampedZ !== nextZ) {
          motion = {
            ...motion,
            vz: -motion.vz,
            changeAt: now + randomBetween(500, 1200),
          };
          motionsRef.current[robot.id] = motion;
          nextZ = clampedZ;
        }

        if (nextX !== current.x || nextZ !== current.z) {
          const nextYaw = Math.atan2(motion.vx, motion.vz);

          nextStates[robot.id] = {
            ...current,
            x: nextX,
            z: nextZ,
            yaw: Number.isFinite(nextYaw) ? nextYaw : current.yaw,
          };
          didChange = true;
        }
      });

      if (!didChange) {
        return currentStates;
      }

      statesRef.current = nextStates;
      return nextStates;
    });
  });

  function handleRobotPointerDown(
    id: RobotId,
    event: ThreeEvent<PointerEvent>,
  ) {
    if (isCompleteRef.current || statesRef.current[id].captured) {
      return;
    }

    event.stopPropagation();
    const robot = statesRef.current[id];

    dragRef.current = {
      kind: "robot",
      id,
      offsetX: robot.x - event.point.x,
      offsetZ: robot.z - event.point.z,
    };
    draggedIdRef.current = id;
    setDraggedId(id);
    setIsDinosaurDragging(false);
  }

  function handleDinosaurPointerDown(event: ThreeEvent<PointerEvent>) {
    if (isCompleteRef.current) {
      return;
    }

    event.stopPropagation();
    const dinosaur = dinosaurStateRef.current;

    dragRef.current = {
      kind: "dinosaur",
      offsetX: dinosaur.x - event.point.x,
      offsetZ: dinosaur.z - event.point.z,
    };
    draggedIdRef.current = null;
    setDraggedId(null);
    setIsDinosaurDragging(true);
  }

  return (
    <>
      <ArenaFloor capturedCount={countCaptured(robotStates)} />
      <TargetBeacon
        point={target}
        radius={difficulties[difficulty].targetRadius}
        visible={targetVisible || isComplete}
      />
      <DinosaurModel
        isDragging={isDinosaurDragging}
        onPointerDown={handleDinosaurPointerDown}
        state={dinosaurState}
      />
      {robotConfigs.map((robot) => (
        <RobotModel
          key={robot.id}
          config={robot}
          isDragging={draggedId === robot.id}
          onPointerDown={(event) => handleRobotPointerDown(robot.id, event)}
          state={robotStates[robot.id]}
        />
      ))}
    </>
  );
}

export default function RobotDragGameV2() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [robotStates, setRobotStates] =
    useState<RobotStates>(createRobotStates);
  const [dinosaurState, setDinosaurState] =
    useState<DinosaurState>(createDinosaurState);
  const [target, setTarget] = useState<TargetPoint>(() => createPoint());
  const [targetVisible, setTargetVisible] = useState(true);
  const [draggedId, setDraggedId] = useState<RobotId | null>(null);
  const [isDinosaurDragging, setIsDinosaurDragging] = useState(false);
  const [capturedCount, setCapturedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  function restartGame(nextDifficulty = difficulty) {
    setDifficulty(nextDifficulty);
    setRobotStates(createRobotStates());
    setDinosaurState(createDinosaurState());
    setTarget(createPoint());
    setTargetVisible(difficulties[nextDifficulty].alwaysVisible);
    setDraggedId(null);
    setIsDinosaurDragging(false);
    setCapturedCount(0);
    setIsComplete(false);
    setRestartKey((current) => current + 1);
  }

  return (
    <main
      aria-label="3D robot drag game"
      className="fixed inset-0 z-50 overflow-hidden bg-[#050816] text-white touch-none"
    >
      <Canvas
        camera={{ fov: 45, position: [0, 5.8, 7.8] }}
        dpr={[1, 2]}
        gl={{ alpha: false, antialias: true }}
        onCreated={({ gl, scene }) => {
          const background = new Color("#050816");

          gl.setClearColor(background, 1);
          scene.background = background;
        }}
        shadows
      >
        <color attach="background" args={["#050816"]} />
        <fog attach="fog" args={["#050816", 8, 16]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          castShadow
          intensity={2.6}
          position={[4.5, 6.5, 4.8]}
          shadow-mapSize-height={1024}
          shadow-mapSize-width={1024}
        />
        <spotLight
          angle={0.48}
          color="#a5f3fc"
          intensity={14}
          penumbra={0.55}
          position={[-3.8, 6, -4.2]}
        />
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
        <RobotArena
          difficulty={difficulty}
          dinosaurState={dinosaurState}
          draggedId={draggedId}
          isDinosaurDragging={isDinosaurDragging}
          isComplete={isComplete}
          onCapturedCountChange={setCapturedCount}
          restartKey={restartKey}
          robotStates={robotStates}
          setDinosaurState={setDinosaurState}
          setDraggedId={setDraggedId}
          setIsDinosaurDragging={setIsDinosaurDragging}
          setIsComplete={setIsComplete}
          setRobotStates={setRobotStates}
          setTarget={setTarget}
          setTargetVisible={setTargetVisible}
          target={target}
          targetVisible={targetVisible}
        />
        <ContactShadows
          blur={2.6}
          far={8}
          opacity={0.42}
          position={[0, 0.02, 0]}
          resolution={1024}
          scale={10}
        />
        <OrbitControls
          enabled={!draggedId && !isDinosaurDragging}
          enableDamping
          enablePan={false}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2.15}
          minDistance={5.8}
          minPolarAngle={Math.PI / 4.2}
          target={[0, 0, 0]}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex w-full max-w-5xl flex-col gap-3 rounded-lg border border-white/15 bg-slate-950/80 p-3 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {difficultyOrder.map((difficultyId) => (
              <button
                key={difficultyId}
                className={[
                  "rounded-md px-4 py-2 text-sm font-semibold transition",
                  difficulty === difficultyId
                    ? "bg-cyan-300 text-slate-950"
                    : "bg-white/10 text-white hover:bg-white/18",
                ].join(" ")}
                onClick={() => restartGame(difficultyId)}
                type="button"
              >
                {difficulties[difficultyId].label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 md:justify-end">
            <div className="rounded-md border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50">
              Rescued {capturedCount}/{ROBOT_COUNT}
            </div>
            <button
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
              onClick={() => restartGame()}
              type="button"
            >
              Restart
            </button>
          </div>
        </div>
      </div>

      {isComplete ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/62 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-cyan-200/30 bg-slate-950/88 p-6 text-center shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Mission Complete
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-white">
              All robots rescued
            </h1>
            <button
              className="mt-6 rounded-md bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
              onClick={() => restartGame()}
              type="button"
            >
              Play Again
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
