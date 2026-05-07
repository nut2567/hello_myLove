"use client";

import {
  Center,
  ContactShadows,
  Environment,
  OrbitControls,
  Text3D,
  type FontData,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { Color, MathUtils, type Group } from "three";
import helvetikerBold from "three/examples/fonts/helvetiker_bold.typeface.json";

const nmcFont = helvetikerBold as unknown as FontData;

function NmcLogo() {
  const logoRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const viewportWidth = useThree((state) => state.viewport.width);
  const [isHovered, setIsHovered] = useState(false);
  const fitScale = Math.min(0.96, viewportWidth / 4.55);

  useFrame(({ pointer }, delta) => {
    const logo = logoRef.current;

    if (!logo) {
      return;
    }

    elapsedRef.current += delta;

    const elapsed = elapsedRef.current;
    const targetScale = fitScale * (isHovered ? 1.08 : 1);
    const nextScale = MathUtils.lerp(logo.scale.x, targetScale, delta * 5);

    logo.position.y = Math.sin(elapsed * 1.15) * 0.08;
    logo.rotation.x = MathUtils.lerp(
      logo.rotation.x,
      0.04 + Math.sin(elapsed * 0.72) * 0.035 + pointer.y * 0.045,
      delta * 3,
    );
    logo.rotation.y = MathUtils.lerp(
      logo.rotation.y,
      -0.18 + pointer.x * 0.08,
      delta * 3,
    );
    logo.rotation.z = MathUtils.lerp(
      logo.rotation.z,
      -pointer.x * 0.045,
      delta * 3,
    );
    logo.scale.setScalar(nextScale);
  });

  return (
    <group
      ref={logoRef}
      onPointerOut={() => setIsHovered(false)}
      onPointerOver={() => setIsHovered(true)}
    >
      <Center precise>
        <group>
          <Text3D
            bevelEnabled
            bevelSegments={8}
            bevelSize={0.026}
            bevelThickness={0.038}
            castShadow
            curveSegments={18}
            font={nmcFont}
            height={0.3}
            letterSpacing={0.025}
            receiveShadow
            size={1.2}
            smooth={0.18}
          >
            NM
            <meshPhysicalMaterial
              clearcoat={0.72}
              clearcoatRoughness={0.2}
              color={isHovered ? "#ffffff" : "#e6fbff"}
              emissive={isHovered ? "#22d3ee" : "#0e7490"}
              emissiveIntensity={isHovered ? 0.18 : 0.08}
              metalness={0.22}
              roughness={0.18}
            />
          </Text3D>

          <Text3D
            bevelEnabled
            bevelSegments={6}
            bevelSize={0.018}
            bevelThickness={0.024}
            castShadow
            curveSegments={14}
            font={nmcFont}
            height={0.18}
            letterSpacing={0.025}
            position={[0.08, -0.08, -0.22]}
            size={1.2}
          >
            NMC
            <meshStandardMaterial
              color="#075985"
              emissive="#164e63"
              emissiveIntensity={0.38}
              metalness={0.2}
              roughness={0.34}
            />
          </Text3D>

          <mesh position={[2.05, -0.18, -0.02]}>
            <boxGeometry args={[0.92, 0.055, 0.12]} />
            <meshStandardMaterial
              color="#f472b6"
              emissive="#db2777"
              emissiveIntensity={0.75}
              metalness={0.26}
              roughness={0.24}
            />
          </mesh>

          <mesh position={[-1.46, 1.02, -0.02]}>
            <boxGeometry args={[1.18, 0.055, 0.12]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#0891b2"
              emissiveIntensity={0.7}
              metalness={0.26}
              roughness={0.24}
            />
          </mesh>
        </group>
      </Center>
    </group>
  );
}

export default function ShipScene() {
  return (
    <div aria-label="Interactive 3D NMC logo" className="h-dvh w-full">
      <Canvas
        camera={{ fov: 38, position: [0, 0.28, 6.4] }}
        dpr={[1, 2]}
        gl={{ alpha: false, antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl, scene }) => {
          const background = new Color("#08080a");

          gl.setClearColor(background, 1);
          scene.background = background;
        }}
        shadows
        className="flex flex-1 flex-col w-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={["#08080a"]} />
        <ambientLight intensity={0.42} />
        <directionalLight castShadow intensity={2.7} position={[3.4, 4.8, 5]} />
        <pointLight
          color="#22d3ee"
          intensity={2.1}
          position={[-3.1, 1.6, 2.8]}
        />
        <pointLight
          color="#f472b6"
          intensity={1.35}
          position={[3.2, -0.6, 2.3]}
        />
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <NmcLogo />
        </Suspense>
        <ContactShadows
          blur={2.8}
          far={3.2}
          opacity={0.48}
          position={[0, -1.36, 0]}
          scale={7}
        />
        <OrbitControls
          dampingFactor={0.08}
          enableDamping
          enablePan={false}
          maxAzimuthAngle={Math.PI / 3}
          maxDistance={8}
          maxPolarAngle={Math.PI / 1.72}
          minAzimuthAngle={-Math.PI / 3}
          minDistance={4.4}
          minPolarAngle={Math.PI / 3.25}
          rotateSpeed={0.72}
          target={[0, 0, 0]}
          zoomSpeed={0.58}
        />
      </Canvas>
    </div>
  );
}
