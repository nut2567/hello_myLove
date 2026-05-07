"use client";

import { Box, Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { Color, MathUtils, type Group } from "three";

function FloatingShip() {
  const shipRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const viewportWidth = useThree((state) => state.viewport.width);
  const [isHovered, setIsHovered] = useState(false);
  const fitScale = Math.min(0.9, viewportWidth / 3.4);

  useFrame(({ pointer }, delta) => {
    const ship = shipRef.current;

    if (!ship) {
      return;
    }

    elapsedRef.current += delta;

    const elapsed = elapsedRef.current;
    const targetScale = fitScale * (isHovered ? 1.08 : 1);
    const nextScale = MathUtils.lerp(ship.scale.x, targetScale, delta * 5);

    ship.position.y = Math.sin(elapsed * 1.35) * 0.16;
    ship.rotation.x = MathUtils.lerp(
      ship.rotation.x,
      Math.sin(elapsed * 0.7) * 0.12 + pointer.y * 0.16,
      delta * 3,
    );
    ship.rotation.y += delta * (isHovered ? 0.65 : 0.35);
    ship.rotation.z = MathUtils.lerp(
      ship.rotation.z,
      -pointer.x * 0.24,
      delta * 3,
    );
    ship.scale.setScalar(nextScale);
  });

  return (
    <group
      ref={shipRef}
      onPointerOut={() => setIsHovered(false)}
      onPointerOver={() => setIsHovered(true)}
      rotation={[0.08, -0.35, -0.1]}
    >
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.72, 2.35, 4]} />
        <meshStandardMaterial
          color="#f8fafc"
          flatShading
          metalness={0.42}
          roughness={0.28}
        />
      </mesh>

      <mesh position={[0.18, 0.28, 0]} scale={[0.58, 0.18, 0.34]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial
          color="#111827"
          metalness={0.2}
          roughness={0.18}
        />
      </mesh>

      <mesh position={[-0.62, -0.38, 0.42]} rotation={[0.25, 0, -0.45]}>
        <boxGeometry args={[0.12, 0.78, 0.08]} />
        <meshStandardMaterial
          color="#60a5fa"
          metalness={0.38}
          roughness={0.24}
        />
      </mesh>

      <mesh position={[-0.62, -0.38, -0.42]} rotation={[-0.25, 0, -0.45]}>
        <boxGeometry args={[0.12, 0.78, 0.08]} />
        <meshStandardMaterial
          color="#60a5fa"
          metalness={0.38}
          roughness={0.24}
        />
      </mesh>

      <mesh position={[-1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.24, 0.5, 32]} />
        <meshStandardMaterial
          color={isHovered ? "#f97316" : "#fbbf24"}
          emissive={isHovered ? "#fb923c" : "#f59e0b"}
          emissiveIntensity={isHovered ? 1.4 : 0.75}
          roughness={0.36}
        />
      </mesh>
    </group>
  );
}

export default function ShipScene() {
  return (
    <div className="h-dvh w-full">
      <Canvas
        camera={{ fov: 42, position: [0, 0.25, 5.2] }}
        dpr={[1, 2]}
        gl={{ alpha: false, antialias: true }}
        onCreated={({ gl, scene }) => {
          const background = new Color("#050816");

          gl.setClearColor(background, 1);
          scene.background = background;
        }}
        className="flex flex-1 flex-col w-full"
      >
        <color attach="background" args={["#050816"]} />
        <ambientLight intensity={0.55} />
        <directionalLight intensity={2.4} position={[3.5, 4.5, 5]} />
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
        <FloatingShip />
      </Canvas>
    </div>
  );
}
