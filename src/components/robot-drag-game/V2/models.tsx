"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, type Group, type Mesh } from "three";

import {
  DINOSAUR_MODEL_SCALE,
  ROBOT_MODEL_SCALE,
} from "@/components/robot-drag-game/V2/robotConfigs";
import type {
  DinosaurState,
  ModelPointerDown,
  RobotConfig,
  RobotState,
  TargetPoint,
} from "@/components/robot-drag-game/V2/types";

export function TargetBeacon({
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
        <ringGeometry args={[radius * 0.88, radius, 50]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#0891b2"
          emissiveIntensity={1.25}
          roughness={0.18}
          transparent
          opacity={0.82}
        />
      </mesh>
    </group>
  );
}

export function RobotModel({
  config,
  isDragging,
  onPointerDown,
  state,
}: {
  config: RobotConfig;
  isDragging: boolean;
  onPointerDown: ModelPointerDown;
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
      ? 0.28 + Math.sin(elapsed * 2.1) * 0.035
      : 0.16 + Math.sin(elapsed * 5.4) * (isDragging ? 0.02 : 0.01);
    const targetScale =
      ROBOT_MODEL_SCALE * (state.captured ? 0.82 : isDragging ? 1.16 : 1);

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

  if (state.removed) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      onPointerDown={state.captured ? undefined : onPointerDown}
      position={[state.x, 0.16, state.z]}
      rotation={[0, state.yaw, 0]}
      scale={[ROBOT_MODEL_SCALE, ROBOT_MODEL_SCALE, ROBOT_MODEL_SCALE]}
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
        <boxGeometry args={[0.22, 0.22, 0.22]} />
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

export function DinosaurModel({
  isDragging,
  onPointerDown,
  state,
}: {
  isDragging: boolean;
  onPointerDown: ModelPointerDown;
  state: DinosaurState;
}) {
  const groupRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    const tail = tailRef.current;

    if (!group) {
      return;
    }

    const elapsed = clock.elapsedTime;
    const targetY =
      0.32 + Math.sin(elapsed * 3.2) * (isDragging ? 0.035 : 0.018);
    const targetScale = isDragging
      ? DINOSAUR_MODEL_SCALE * 1.13
      : DINOSAUR_MODEL_SCALE;

    group.position.x = MathUtils.lerp(group.position.x, state.x, delta * 14);
    group.position.y = MathUtils.lerp(group.position.y, targetY, delta * 9);
    group.position.z = MathUtils.lerp(group.position.z, state.z, delta * 14);
    group.rotation.y = MathUtils.lerp(group.rotation.y, state.yaw, delta * 8);
    group.scale.setScalar(
      MathUtils.lerp(group.scale.x, targetScale, delta * 9),
    );

    if (tail) {
      tail.rotation.y = Math.sin(elapsed * (isDragging ? 8.5 : 3.6)) * 0.22;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={onPointerDown}
      position={[state.x, 0.32, state.z]}
      rotation={[0, state.yaw, 0]}
      scale={[DINOSAUR_MODEL_SCALE, DINOSAUR_MODEL_SCALE, DINOSAUR_MODEL_SCALE]}
    >
      <mesh castShadow position={[0, 0.22, 0]} scale={[1.35, 0.72, 0.55]}>
        <sphereGeometry args={[0.42, 28, 18]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#065f46"
          emissiveIntensity={isDragging ? 0.38 : 0.16}
          roughness={0.42}
        />
      </mesh>

      <mesh castShadow position={[0, 0.45, -0.43]} scale={[0.82, 0.82, 1]}>
        <sphereGeometry args={[0.27, 24, 16]} />
        <meshStandardMaterial
          color="#6ee7b7"
          emissive="#047857"
          emissiveIntensity={isDragging ? 0.28 : 0.12}
          roughness={0.36}
        />
      </mesh>

      <mesh castShadow position={[0, 0.39, -0.68]}>
        <boxGeometry args={[0.28, 0.16, 0.28]} />
        <meshStandardMaterial color="#a7f3d0" roughness={0.4} />
      </mesh>

      <mesh castShadow position={[-0.1, 0.51, -0.68]}>
        <sphereGeometry args={[0.035, 14, 10]} />
        <meshStandardMaterial
          color="#020617"
          emissive="#d9f99d"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh castShadow position={[0.1, 0.51, -0.68]}>
        <sphereGeometry args={[0.035, 14, 10]} />
        <meshStandardMaterial
          color="#020617"
          emissive="#d9f99d"
          emissiveIntensity={0.8}
        />
      </mesh>

      <group ref={tailRef} position={[0, 0.2, 0.42]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.22]}>
          <cylinderGeometry args={[0.055, 0.19, 0.74, 18]} />
          <meshStandardMaterial color="#22c55e" roughness={0.42} />
        </mesh>
      </group>

      {[-0.22, 0, 0.22].map((z) => (
        <mesh key={z} castShadow position={[0, 0.62, z]}>
          <coneGeometry args={[0.09, 0.18, 14]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#ca8a04"
            emissiveIntensity={0.22}
            roughness={0.28}
          />
        </mesh>
      ))}

      <mesh castShadow position={[-0.22, -0.06, -0.18]}>
        <boxGeometry args={[0.13, 0.34, 0.16]} />
        <meshStandardMaterial color="#16a34a" roughness={0.44} />
      </mesh>
      <mesh castShadow position={[0.22, -0.06, -0.18]}>
        <boxGeometry args={[0.13, 0.34, 0.16]} />
        <meshStandardMaterial color="#16a34a" roughness={0.44} />
      </mesh>
      <mesh castShadow position={[-0.2, -0.08, 0.24]}>
        <boxGeometry args={[0.12, 0.3, 0.15]} />
        <meshStandardMaterial color="#15803d" roughness={0.44} />
      </mesh>
      <mesh castShadow position={[0.2, -0.08, 0.24]}>
        <boxGeometry args={[0.12, 0.3, 0.15]} />
        <meshStandardMaterial color="#15803d" roughness={0.44} />
      </mesh>

      <mesh castShadow position={[-0.31, 0.22, -0.32]} rotation={[0, 0, -0.42]}>
        <boxGeometry args={[0.08, 0.24, 0.1]} />
        <meshStandardMaterial color="#bbf7d0" roughness={0.46} />
      </mesh>
      <mesh castShadow position={[0.31, 0.22, -0.32]} rotation={[0, 0, 0.42]}>
        <boxGeometry args={[0.08, 0.24, 0.1]} />
        <meshStandardMaterial color="#bbf7d0" roughness={0.46} />
      </mesh>
    </group>
  );
}
