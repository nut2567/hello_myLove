"use client";

import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { Color, MathUtils, type Group, type Mesh } from "three";

import { robotConfigs } from "@/components/robot-drag-game/V2/robotConfigs";

export type PrototypeModel = "robot" | "dino";

const previewRobot = robotConfigs[0];

function RobotPreviewModel() {
  const headRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const head = headRef.current;

    if (head) {
      head.rotation.y = Math.sin(clock.elapsedTime * 2.4) * 0.16;
    }
  });

  return (
    <group scale={1.9}>
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.58, 0.38]} />
        <meshStandardMaterial
          color={previewRobot.primary}
          emissive={previewRobot.emissive}
          emissiveIntensity={0.22}
          metalness={0.36}
          roughness={0.34}
        />
      </mesh>

      <mesh ref={headRef} castShadow position={[0, 0.54, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial
          color={previewRobot.secondary}
          metalness={0.24}
          roughness={0.26}
        />
      </mesh>

      <mesh castShadow position={[-0.16, 0.58, -0.25]}>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial
          color="#020617"
          emissive={previewRobot.primary}
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh castShadow position={[0.16, 0.58, -0.25]}>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial
          color="#020617"
          emissive={previewRobot.primary}
          emissiveIntensity={1.2}
        />
      </mesh>

      <mesh castShadow position={[0, 0.84, 0]}>
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
          color={previewRobot.primary}
          emissive={previewRobot.emissive}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh castShadow position={[-0.4, 0.15, 0]}>
        <boxGeometry args={[0.12, 0.42, 0.14]} />
        <meshStandardMaterial
          color={previewRobot.secondary}
          metalness={0.18}
          roughness={0.32}
        />
      </mesh>
      <mesh castShadow position={[0.4, 0.15, 0]}>
        <boxGeometry args={[0.12, 0.42, 0.14]} />
        <meshStandardMaterial
          color={previewRobot.secondary}
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
    </group>
  );
}

function DinosaurPreviewModel() {
  const tailRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const tail = tailRef.current;

    if (tail) {
      tail.rotation.y = Math.sin(clock.elapsedTime * 3.6) * 0.22;
    }
  });

  return (
    <group scale={1.85}>
      <mesh castShadow position={[0, 0.22, 0]} scale={[1.35, 0.72, 0.55]}>
        <sphereGeometry args={[0.42, 28, 18]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#065f46"
          emissiveIntensity={0.18}
          roughness={0.42}
        />
      </mesh>

      <mesh castShadow position={[0, 0.45, -0.43]} scale={[0.82, 0.82, 1]}>
        <sphereGeometry args={[0.27, 24, 16]} />
        <meshStandardMaterial
          color="#6ee7b7"
          emissive="#047857"
          emissiveIntensity={0.14}
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
        <mesh castShadow position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
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

function PreviewModel({ model }: { model: PrototypeModel }) {
  const groupRef = useRef<Group>(null);
  const viewportWidth = useThree((state) => state.viewport.width);
  const fitScale =
    model === "robot"
      ? Math.min(1, viewportWidth / 4.6)
      : Math.min(1, viewportWidth / 3.9);
  useFrame(({ pointer }, delta) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      pointer.y * 0.08,
      delta * 3,
    );
    group.rotation.y += delta * 0.42;
  });

  return (
    <group
      ref={groupRef}
      position={[0, model === "robot" ? -0.56 : -0.62, 0]}
      rotation={[0, Math.PI, 0]}
      scale={fitScale}
    >
      {model === "robot" ? <RobotPreviewModel /> : <DinosaurPreviewModel />}
    </group>
  );
}

export default function PrototypeModelScene({
  model,
}: {
  model: PrototypeModel;
}) {
  const label =
    model === "robot"
      ? "3D robot prototype model"
      : "3D dinosaur prototype model";

  return (
    <main aria-label={label} className="h-dvh w-full overflow-hidden bg-[#050816]">
      <Canvas
        camera={{ fov: 38, position: [0, 1.1, 5.8] }}
        dpr={[1, 2]}
        gl={{ alpha: false, antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl, scene }) => {
          const background = new Color("#050816");

          gl.setClearColor(background, 1);
          scene.background = background;
        }}
        shadows
      >
        <color attach="background" args={["#050816"]} />
        <ambientLight intensity={0.72} />
        <directionalLight
          castShadow
          intensity={2.6}
          position={[3.2, 4.8, 4.4]}
          shadow-mapSize-height={1024}
          shadow-mapSize-width={1024}
        />
        <pointLight color="#67e8f9" intensity={2.2} position={[-3, 2.2, 2.8]} />
        <pointLight color="#f0abfc" intensity={1.35} position={[3, 1.3, -2.8]} />
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
        <PreviewModel model={model} />
        <ContactShadows
          blur={2.5}
          far={5}
          opacity={0.42}
          position={[0, -1.05, 0]}
          resolution={1024}
          scale={5}
        />
        <OrbitControls
          enableDamping
          enablePan={false}
          maxDistance={8}
          maxPolarAngle={Math.PI / 1.85}
          minDistance={3.2}
          minPolarAngle={Math.PI / 4.2}
          rotateSpeed={0.64}
          target={[0, 0.1, 0]}
        />
      </Canvas>
    </main>
  );
}
