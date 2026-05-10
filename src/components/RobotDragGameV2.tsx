"use client";

import {
  ContactShadows,
  Environment,
  Html,
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
import { Color, MathUtils, Plane, Vector3, type Group, type Mesh } from "three";

type RobotId = "bolt" | "chip" | "byte" | "nix" | "pixel";
type Difficulty = "easy" | "medium" | "hard";

type RobotConfig = {
  id: RobotId;
  name: string;
  primary: string;
  secondary: string;
  emissive: string;
  phase: number;
};

type RobotState = {
  x: number;
  z: number;
  yaw: number;
  captured: boolean;
};

type RobotStates = Record<RobotId, RobotState>;

type RobotMotion = {
  vx: number;
  vz: number;
  changeAt: number;
  pauseUntil: number;
};

type RobotMotions = Record<RobotId, RobotMotion>;

type TargetPoint = {
  x: number;
  z: number;
};

type DragSession = {
  id: RobotId;
  offsetX: number;
  offsetZ: number;
};

type DifficultySettings = {
  label: string;
  speed: number;
  targetRadius: number;
  alwaysVisible: boolean;
  flashDuration: [number, number];
  flashInterval: [number, number];
  nearRevealDistance: number;
};

const ARENA_WIDTH = 9.6;
const ARENA_DEPTH = 6.2;
const HALF_WIDTH = ARENA_WIDTH / 2;
const HALF_DEPTH = ARENA_DEPTH / 2;
const ROBOT_RADIUS = 0.42;
const ROBOT_COUNT = 5;

const robotConfigs: RobotConfig[] = [
  {
    id: "bolt",
    name: "Bolt",
    primary: "#38bdf8",
    secondary: "#dbeafe",
    emissive: "#0ea5e9",
    phase: 0,
  },
  {
    id: "chip",
    name: "Chip",
    primary: "#a3e635",
    secondary: "#ecfccb",
    emissive: "#65a30d",
    phase: 1.1,
  },
  {
    id: "byte",
    name: "Byte",
    primary: "#f472b6",
    secondary: "#fce7f3",
    emissive: "#db2777",
    phase: 2.2,
  },
  {
    id: "nix",
    name: "Nix",
    primary: "#fbbf24",
    secondary: "#fef3c7",
    emissive: "#d97706",
    phase: 3.3,
  },
  {
    id: "pixel",
    name: "Pixel",
    primary: "#818cf8",
    secondary: "#e0e7ff",
    emissive: "#4f46e5",
    phase: 4.4,
  },
];

const difficulties: Record<Difficulty, DifficultySettings> = {
  easy: {
    label: "Easy",
    speed: 0.62,
    targetRadius: 0.9,
    alwaysVisible: true,
    flashDuration: [900, 1300],
    flashInterval: [1800, 2600],
    nearRevealDistance: 1.8,
  },
  medium: {
    label: "Medium",
    speed: 0.88,
    targetRadius: 0.76,
    alwaysVisible: false,
    flashDuration: [650, 950],
    flashInterval: [2600, 4300],
    nearRevealDistance: 1.45,
  },
  hard: {
    label: "Hard",
    speed: 1.18,
    targetRadius: 0.64,
    alwaysVisible: false,
    flashDuration: [180, 320],
    flashInterval: [4600, 7200],
    nearRevealDistance: 1.1,
  },
};

const difficultyOrder: Difficulty[] = ["easy", "medium", "hard"];

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

function getDockPoint(index: number): TargetPoint {
  const gap = 0.95;
  const start = -((ROBOT_COUNT - 1) * gap) / 2;

  return {
    x: start + index * gap,
    z: HALF_DEPTH - 0.55,
  };
}

function countCaptured(states: RobotStates) {
  return robotConfigs.reduce(
    (total, robot) => total + (states[robot.id].captured ? 1 : 0),
    0,
  );
}

function ArenaFloor({ capturedCount }: { capturedCount: number }) {
  return (
    <group>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
      >
        <planeGeometry args={[ARENA_WIDTH + 1.4, ARENA_DEPTH + 1.4]} />
        <meshStandardMaterial
          color="#07111f"
          roughness={0.72}
          metalness={0.08}
        />
      </mesh>

      <gridHelper
        args={[11, 22, "#38bdf8", "#1e293b"]}
        position={[0, 0.004, 0]}
      />

      <mesh receiveShadow position={[0, 0.12, -HALF_DEPTH - 0.06]}>
        <boxGeometry args={[ARENA_WIDTH, 0.24, 0.12]} />
        <meshStandardMaterial
          color="#164e63"
          roughness={0.4}
          metalness={0.25}
        />
      </mesh>
      <mesh receiveShadow position={[0, 0.12, HALF_DEPTH + 0.06]}>
        <boxGeometry args={[ARENA_WIDTH, 0.24, 0.12]} />
        <meshStandardMaterial
          color="#164e63"
          roughness={0.4}
          metalness={0.25}
        />
      </mesh>
      <mesh receiveShadow position={[-HALF_WIDTH - 0.06, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.24, ARENA_DEPTH]} />
        <meshStandardMaterial
          color="#164e63"
          roughness={0.4}
          metalness={0.25}
        />
      </mesh>
      <mesh receiveShadow position={[HALF_WIDTH + 0.06, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.24, ARENA_DEPTH]} />
        <meshStandardMaterial
          color="#164e63"
          roughness={0.4}
          metalness={0.25}
        />
      </mesh>

      {robotConfigs.map((robot, index) => {
        const dock = getDockPoint(index);
        const isFilled = index < capturedCount;

        return (
          <group key={robot.id} position={[dock.x, 0.03, dock.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.24, 0.34, 28]} />
              <meshStandardMaterial
                color={isFilled ? robot.primary : "#334155"}
                emissive={isFilled ? robot.emissive : "#0f172a"}
                emissiveIntensity={isFilled ? 0.75 : 0.08}
                roughness={0.32}
                transparent
                opacity={isFilled ? 0.9 : 0.45}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function TargetBeacon({
  point,
  radius,
  visible,
}: {
  point: TargetPoint;
  radius: number;
  visible: boolean;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const elapsed = clock.elapsedTime;
    group.rotation.y = elapsed * 0.85;
    group.scale.setScalar(1 + Math.sin(elapsed * 4.8) * 0.055);
  });

  return (
    <group ref={groupRef} position={[point.x, 0.05, point.z]} visible={visible}>
      <pointLight
        color="#22d3ee"
        intensity={1.8}
        distance={3.8}
        position={[0, 0.55, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.88, radius, 100]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#0891b2"
          emissiveIntensity={1.25}
          roughness={0.18}
          transparent
          opacity={0.82}
        />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[radius * 0.38, radius * 0.56, 0.12, 40]} />
        <meshStandardMaterial
          color="#cffafe"
          emissive="#22d3ee"
          emissiveIntensity={0.9}
          roughness={0.22}
          transparent
          opacity={0.74}
        />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <sphereGeometry args={[0.12, 24, 16]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#67e8f9"
          emissiveIntensity={1.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function RobotModel({
  config,
  isDragging,
  onPointerDown,
  state,
}: {
  config: RobotConfig;
  isDragging: boolean;
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  state: RobotState;
}) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    const head = headRef.current;

    if (!group) {
      return;
    }

    const elapsed = clock.elapsedTime + config.phase;
    const targetY = state.captured
      ? 0.78 + Math.sin(elapsed * 2.1) * 0.07
      : 0.48 + Math.sin(elapsed * 5.4) * (isDragging ? 0.035 : 0.018);
    const targetScale = state.captured ? 0.82 : isDragging ? 1.16 : 1;

    group.position.x = MathUtils.lerp(group.position.x, state.x, delta * 14);
    group.position.y = MathUtils.lerp(group.position.y, targetY, delta * 9);
    group.position.z = MathUtils.lerp(group.position.z, state.z, delta * 14);
    group.rotation.y = MathUtils.lerp(group.rotation.y, state.yaw, delta * 8);
    group.scale.setScalar(
      MathUtils.lerp(group.scale.x, targetScale, delta * 9),
    );

    if (head) {
      head.rotation.y = Math.sin(elapsed * 2.4) * 0.16;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={state.captured ? undefined : onPointerDown}
      position={[state.x, 0.48, state.z]}
      rotation={[0, state.yaw, 0]}
    >
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.58, 0.38]} />
        <meshStandardMaterial
          color={config.primary}
          emissive={config.emissive}
          emissiveIntensity={isDragging ? 0.42 : 0.16}
          metalness={0.36}
          roughness={0.34}
        />
      </mesh>

      <mesh ref={headRef} castShadow position={[0, 0.54, 0]}>
        <boxGeometry args={[0.62, 0.42, 0.48]} />
        <meshStandardMaterial
          color={config.secondary}
          metalness={0.24}
          roughness={0.26}
        />
      </mesh>

      <mesh castShadow position={[-0.16, 0.58, -0.25]}>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial
          color="#020617"
          emissive={config.primary}
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh castShadow position={[0.16, 0.58, -0.25]}>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial
          color="#020617"
          emissive={config.primary}
          emissiveIntensity={1.2}
        />
      </mesh>

      <mesh castShadow position={[0, 0.84, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.28, 12]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.5}
          roughness={0.28}
        />
      </mesh>
      <mesh castShadow position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshStandardMaterial
          color={config.primary}
          emissive={config.emissive}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh castShadow position={[-0.4, 0.15, 0]}>
        <boxGeometry args={[0.12, 0.42, 0.14]} />
        <meshStandardMaterial
          color={config.secondary}
          metalness={0.18}
          roughness={0.32}
        />
      </mesh>
      <mesh castShadow position={[0.4, 0.15, 0]}>
        <boxGeometry args={[0.12, 0.42, 0.14]} />
        <meshStandardMaterial
          color={config.secondary}
          metalness={0.18}
          roughness={0.32}
        />
      </mesh>

      <mesh castShadow position={[-0.18, -0.26, 0.04]}>
        <boxGeometry args={[0.14, 0.24, 0.2]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.34}
          roughness={0.28}
        />
      </mesh>
      <mesh castShadow position={[0.18, -0.26, 0.04]}>
        <boxGeometry args={[0.14, 0.24, 0.2]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.34}
          roughness={0.28}
        />
      </mesh>

      {isDragging ? (
        <Html center distanceFactor={7} position={[0, 1.36, 0]}>
          <div className="rounded-md border border-cyan-200/70 bg-slate-950/85 px-2 py-1 text-xs font-semibold text-cyan-100 shadow-lg">
            {config.name}
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function RobotArena({
  difficulty,
  draggedId,
  isComplete,
  onCapturedCountChange,
  restartKey,
  robotStates,
  setDraggedId,
  setIsComplete,
  setRobotStates,
  setTarget,
  setTargetVisible,
  target,
  targetVisible,
}: {
  difficulty: Difficulty;
  draggedId: RobotId | null;
  isComplete: boolean;
  onCapturedCountChange: (count: number) => void;
  restartKey: number;
  robotStates: RobotStates;
  setDraggedId: Dispatch<SetStateAction<RobotId | null>>;
  setIsComplete: Dispatch<SetStateAction<boolean>>;
  setRobotStates: Dispatch<SetStateAction<RobotStates>>;
  setTarget: Dispatch<SetStateAction<TargetPoint>>;
  setTargetVisible: Dispatch<SetStateAction<boolean>>;
  target: TargetPoint;
  targetVisible: boolean;
}) {
  const { camera, pointer, raycaster } = useThree();
  const statesRef = useRef(robotStates);
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
    setTargetVisible(difficulties[difficulty].alwaysVisible);
  }, [difficulty, restartKey, setDraggedId, setTargetVisible]);

  const finishDrag = useCallback(() => {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    dragRef.current = null;
    setDraggedId(null);

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
      const activeDrag = dragRef.current?.id;

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
      id,
      offsetX: robot.x - event.point.x,
      offsetZ: robot.z - event.point.z,
    };
    draggedIdRef.current = id;
    setDraggedId(id);
  }

  return (
    <>
      <ArenaFloor capturedCount={countCaptured(robotStates)} />
      <TargetBeacon
        point={target}
        radius={difficulties[difficulty].targetRadius}
        visible={targetVisible || isComplete}
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
  const [target, setTarget] = useState<TargetPoint>(() => createPoint());
  const [targetVisible, setTargetVisible] = useState(true);
  const [draggedId, setDraggedId] = useState<RobotId | null>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  function restartGame(nextDifficulty = difficulty) {
    setDifficulty(nextDifficulty);
    setRobotStates(createRobotStates());
    setTarget(createPoint());
    setTargetVisible(difficulties[nextDifficulty].alwaysVisible);
    setDraggedId(null);
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
          draggedId={draggedId}
          isComplete={isComplete}
          onCapturedCountChange={setCapturedCount}
          restartKey={restartKey}
          robotStates={robotStates}
          setDraggedId={setDraggedId}
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
          enabled={!draggedId}
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
