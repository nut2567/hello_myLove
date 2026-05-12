"use client";

import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
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
  dinosaurIds,
  difficulties,
  difficultyOrder,
  getDockPoint,
  robotConfigs,
} from "@/components/robot-drag-game/V2/robotConfigs";
import type {
  DinosaurId,
  DinosaurMotion,
  DinosaurMotions,
  DinosaurStates,
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

function getForwardYaw(deltaX: number, deltaZ: number) {
  if (Math.hypot(deltaX, deltaZ) < 0.0001) {
    return Number.NaN;
  }

  return Math.atan2(-deltaX, -deltaZ);
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

function clampArenaPoint(point: TargetPoint, radius: number): TargetPoint {
  return {
    x: clamp(point.x, -HALF_WIDTH + radius, HALF_WIDTH - radius),
    z: clamp(point.z, -HALF_DEPTH + radius, HALF_DEPTH - radius),
  };
}

function isTargetGuardedByDinosaur(
  dinosaurs: DinosaurStates,
  target: TargetPoint,
  targetRadius: number,
) {
  return dinosaurIds.some(
    (id) => distance2D(dinosaurs[id], target) <= targetRadius + DINOSAUR_RADIUS,
  );
}

function createDinosaurStates(): DinosaurStates {
  return dinosaurIds.reduce<DinosaurStates>((states, id, index) => {
    const point = clampArenaPoint(
      {
        x:
          (index === 0 ? HALF_WIDTH * 0.55 : -HALF_WIDTH * 0.55) +
          randomBetween(-0.35, 0.35),
        z:
          (index === 0 ? -HALF_DEPTH * 0.35 : HALF_DEPTH * 0.18) +
          randomBetween(-0.35, 0.35),
      },
      DINOSAUR_RADIUS,
    );

    states[id] = {
      ...point,
      yaw: randomBetween(-Math.PI, Math.PI),
    };

    return states;
  }, {} as DinosaurStates);
}

function clampDinosaurPoint(point: TargetPoint): TargetPoint {
  return clampArenaPoint(point, DINOSAUR_RADIUS);
}

function clampRobotPoint(point: TargetPoint): TargetPoint {
  return clampArenaPoint(point, ROBOT_RADIUS);
}

function createDinosaurMotion(
  now: number,
  difficulty: Difficulty,
): DinosaurMotion {
  if (Math.random() < 0.22) {
    const pauseUntil = now + randomBetween(420, 1100);

    return {
      vx: 0,
      vz: 0,
      changeAt: pauseUntil,
      pauseUntil,
    };
  }

  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(0.28, 0.58) * difficulties[difficulty].speed;

  return {
    vx: Math.cos(angle) * speed,
    vz: Math.sin(angle) * speed,
    changeAt: now + randomBetween(1200, 3100),
    pauseUntil: 0,
  };
}

function createDinosaurMotions(
  now: number,
  difficulty: Difficulty,
): DinosaurMotions {
  return dinosaurIds.reduce<DinosaurMotions>((motions, id) => {
    motions[id] = createDinosaurMotion(now + randomBetween(0, 600), difficulty);

    return motions;
  }, {} as DinosaurMotions);
}

function moveWithinArena(
  point: TargetPoint,
  motion: { vx: number; vz: number },
  radius: number,
  delta: number,
) {
  let nextX = point.x + motion.vx * delta;
  let nextZ = point.z + motion.vz * delta;
  const clamped = clampArenaPoint({ x: nextX, z: nextZ }, radius);

  nextX = clamped.x;
  nextZ = clamped.z;

  return {
    x: nextX,
    z: nextZ,
    hitX: clamped.x !== point.x + motion.vx * delta,
    hitZ: clamped.z !== point.z + motion.vz * delta,
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
      removed: false,
    };

    return states;
  }, {} as RobotStates);
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
    (total, robot) =>
      total +
      (states[robot.id].captured && !states[robot.id].removed ? 1 : 0),
    0,
  );
}

function RobotArena({
  difficulty,
  dinosaurStates,
  draggedId,
  draggedDinosaurId,
  isComplete,
  onCapturedCountChange,
  restartKey,
  robotStates,
  setDinosaurStates,
  setDraggedId,
  setDraggedDinosaurId,
  setIsComplete,
  setRobotStates,
  setTarget,
  setTargetVisible,
  target,
  targetVisible,
}: {
  difficulty: Difficulty;
  dinosaurStates: DinosaurStates;
  draggedId: RobotId | null;
  draggedDinosaurId: DinosaurId | null;
  isComplete: boolean;
  onCapturedCountChange: (count: number) => void;
  restartKey: number;
  robotStates: RobotStates;
  setDinosaurStates: Dispatch<SetStateAction<DinosaurStates>>;
  setDraggedId: Dispatch<SetStateAction<RobotId | null>>;
  setDraggedDinosaurId: Dispatch<SetStateAction<DinosaurId | null>>;
  setIsComplete: Dispatch<SetStateAction<boolean>>;
  setRobotStates: Dispatch<SetStateAction<RobotStates>>;
  setTarget: Dispatch<SetStateAction<TargetPoint>>;
  setTargetVisible: Dispatch<SetStateAction<boolean>>;
  target: TargetPoint;
  targetVisible: boolean;
}) {
  const { camera, pointer, raycaster } = useThree();
  const statesRef = useRef(robotStates);
  const dinosaurStatesRef = useRef(dinosaurStates);
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
  const dinosaurMotionsRef = useRef<DinosaurMotions>(
    createDinosaurMotions(getNow(), difficulty),
  );
  const flashRef = useRef(createFlashSchedule(getNow(), difficulty));

  useEffect(() => {
    statesRef.current = robotStates;
  }, [robotStates]);

  useEffect(() => {
    dinosaurStatesRef.current = dinosaurStates;
  }, [dinosaurStates]);

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
    dinosaurMotionsRef.current = createDinosaurMotions(now, difficulty);
    flashRef.current = createFlashSchedule(now, difficulty);
    dragRef.current = null;
    setDraggedId(null);
    setDraggedDinosaurId(null);
    setTargetVisible(difficulties[difficulty].alwaysVisible);
  }, [
    difficulty,
    restartKey,
    setDraggedDinosaurId,
    setDraggedId,
    setTargetVisible,
  ]);

  const finishDrag = useCallback(() => {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    dragRef.current = null;
    setDraggedId(null);
    setDraggedDinosaurId(null);

    if (drag.kind === "dinosaur") {
      return;
    }

    const settings = difficulties[difficultyRef.current];
    const currentStates = statesRef.current;
    const currentRobot = currentStates[drag.id];

    if (!currentRobot || currentRobot.captured || currentRobot.removed) {
      return;
    }

    const robotPoint = {
      x: currentRobot.x,
      z: currentRobot.z,
    };

    if (distance2D(robotPoint, targetRef.current) > settings.targetRadius) {
      return;
    }

    if (
      isTargetGuardedByDinosaur(
        dinosaurStatesRef.current,
        targetRef.current,
        settings.targetRadius,
      )
    ) {
      const nextStates: RobotStates = {
        ...currentStates,
        [drag.id]: {
          ...currentRobot,
          x: HALF_WIDTH + 2,
          z: HALF_DEPTH + 2,
          captured: false,
          removed: true,
        },
      };

      statesRef.current = nextStates;
      setRobotStates(nextStates);
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
    setDraggedDinosaurId,
    setDraggedId,
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
          const currentDinosaurStates = dinosaurStatesRef.current;
          const currentDinosaur = currentDinosaurStates[drag.id];
          const nextPoint = clampDinosaurPoint(
            {
              x: pointerWorldRef.current.x + drag.offsetX,
              z: pointerWorldRef.current.z + drag.offsetZ,
            },
          );
          const nextYaw = getForwardYaw(
            nextPoint.x - currentDinosaur.x,
            nextPoint.z - currentDinosaur.z,
          );
          const nextDinosaurStates: DinosaurStates = {
            ...currentDinosaurStates,
            [drag.id]: {
              x: nextPoint.x,
              z: nextPoint.z,
              yaw: Number.isFinite(nextYaw) ? nextYaw : currentDinosaur.yaw,
            },
          };

          dinosaurStatesRef.current = nextDinosaurStates;
          setDinosaurStates(nextDinosaurStates);
        } else {
          const currentStates = statesRef.current;
          const currentRobot = currentStates[drag.id];

          if (currentRobot && !currentRobot.captured && !currentRobot.removed) {
            const nextPoint = clampRobotPoint({
              x: pointerWorldRef.current.x + drag.offsetX,
              z: pointerWorldRef.current.z + drag.offsetZ,
            });
            const nextYaw = getForwardYaw(
              nextPoint.x - currentRobot.x,
              nextPoint.z - currentRobot.z,
            );
            const nextStates: RobotStates = {
              ...currentStates,
              [drag.id]: {
                ...currentRobot,
                x: nextPoint.x,
                z: nextPoint.z,
                yaw: Number.isFinite(nextYaw) ? nextYaw : currentRobot.yaw,
              },
            };

            statesRef.current = nextStates;
            setRobotStates(nextStates);
            nearReveal =
              distance2D(nextPoint, targetRef.current) <
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

    setDinosaurStates((currentStates) => {
      let didChange = false;
      const nextStates: DinosaurStates = { ...currentStates };
      const activeDrag =
        dragRef.current?.kind === "dinosaur" ? dragRef.current.id : null;

      dinosaurIds.forEach((id) => {
        const current = currentStates[id];

        if (id === activeDrag) {
          return;
        }

        let motion = dinosaurMotionsRef.current[id];

        if (now >= motion.changeAt) {
          motion = createDinosaurMotion(now, difficultyRef.current);
          dinosaurMotionsRef.current[id] = motion;
        }

        if (now < motion.pauseUntil) {
          return;
        }

        const moved = moveWithinArena(
          current,
          motion,
          DINOSAUR_RADIUS,
          delta,
        );

        if (moved.hitX) {
          motion = {
            ...motion,
            vx: -motion.vx,
            changeAt: now + randomBetween(700, 1400),
          };
          dinosaurMotionsRef.current[id] = motion;
        }

        if (moved.hitZ) {
          motion = {
            ...motion,
            vz: -motion.vz,
            changeAt: now + randomBetween(700, 1400),
          };
          dinosaurMotionsRef.current[id] = motion;
        }

        if (moved.x !== current.x || moved.z !== current.z) {
          const nextYaw = getForwardYaw(motion.vx, motion.vz);

          nextStates[id] = {
            ...current,
            x: moved.x,
            z: moved.z,
            yaw: Number.isFinite(nextYaw) ? nextYaw : current.yaw,
          };
          didChange = true;
        }
      });

      if (!didChange) {
        return currentStates;
      }

      dinosaurStatesRef.current = nextStates;
      return nextStates;
    });

    setRobotStates((currentStates) => {
      let didChange = false;
      const nextStates: RobotStates = { ...currentStates };
      const activeDrag =
        dragRef.current?.kind === "robot" ? dragRef.current.id : null;

      robotConfigs.forEach((robot) => {
        const current = currentStates[robot.id];

        if (current.captured || current.removed || robot.id === activeDrag) {
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
          const nextYaw = getForwardYaw(motion.vx, motion.vz);

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
    if (
      isCompleteRef.current ||
      statesRef.current[id].captured ||
      statesRef.current[id].removed
    ) {
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
    setDraggedDinosaurId(null);
  }

  function handleDinosaurPointerDown(
    id: DinosaurId,
    event: ThreeEvent<PointerEvent>,
  ) {
    if (isCompleteRef.current) {
      return;
    }

    event.stopPropagation();
    const dinosaur = dinosaurStatesRef.current[id];

    dragRef.current = {
      kind: "dinosaur",
      id,
      offsetX: dinosaur.x - event.point.x,
      offsetZ: dinosaur.z - event.point.z,
    };
    draggedIdRef.current = null;
    setDraggedId(null);
    setDraggedDinosaurId(id);
  }

  return (
    <>
      <ArenaFloor capturedCount={countCaptured(robotStates)} />
      <TargetBeacon
        point={target}
        radius={difficulties[difficulty].targetRadius}
        visible={targetVisible || isComplete}
      />
      {dinosaurIds.map((id) => (
        <DinosaurModel
          key={id}
          isDragging={draggedDinosaurId === id}
          onPointerDown={(event) => handleDinosaurPointerDown(id, event)}
          state={dinosaurStates[id]}
        />
      ))}
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
  const [target, setTarget] = useState<TargetPoint>(() => createPoint());
  const [dinosaurStates, setDinosaurStates] =
    useState<DinosaurStates>(createDinosaurStates);
  const [targetVisible, setTargetVisible] = useState(true);
  const [draggedId, setDraggedId] = useState<RobotId | null>(null);
  const [draggedDinosaurId, setDraggedDinosaurId] =
    useState<DinosaurId | null>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  function restartGame(nextDifficulty = difficulty) {
    const nextTarget = createPoint();

    setDifficulty(nextDifficulty);
    setRobotStates(createRobotStates());
    setTarget(nextTarget);
    setDinosaurStates(createDinosaurStates());
    setTargetVisible(difficulties[nextDifficulty].alwaysVisible);
    setDraggedId(null);
    setDraggedDinosaurId(null);
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
          intensity={140}
          penumbra={2.55}
          position={[-3.8, 6, -4.2]}
        />
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
        <RobotArena
          difficulty={difficulty}
          dinosaurStates={dinosaurStates}
          draggedId={draggedId}
          draggedDinosaurId={draggedDinosaurId}
          isComplete={isComplete}
          onCapturedCountChange={setCapturedCount}
          restartKey={restartKey}
          robotStates={robotStates}
          setDinosaurStates={setDinosaurStates}
          setDraggedId={setDraggedId}
          setDraggedDinosaurId={setDraggedDinosaurId}
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
          enabled={!draggedId && !draggedDinosaurId}
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
