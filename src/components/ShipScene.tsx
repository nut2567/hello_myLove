"use client";

import {
  Center,
  ContactShadows,
  Environment,
  OrbitControls,
  RoundedBox,
  Text3D,
  type FontData,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { Color, MathUtils, type Group } from "three";
import helvetikerBold from "three/examples/fonts/helvetiker_bold.typeface.json";

const nmcFont = helvetikerBold as unknown as FontData;
type VectorTuple = [number, number, number];

function NmcLogoV1() {
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
            NMC
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

type LayeredLetterProps = {
  letter: string;
  position: VectorTuple;
  scale?: VectorTuple;
};

function LayeredLetter({
  letter,
  position,
  scale = [1, 1, 1],
}: LayeredLetterProps) {
  return (
    <group position={position} scale={scale}>
      <Text3D
        bevelEnabled
        bevelSegments={4}
        bevelSize={0.024}
        bevelThickness={0.04}
        castShadow
        curveSegments={16}
        font={nmcFont}
        height={0.24}
        position={[0.1, -0.08, -0.26]}
        receiveShadow
        size={1.36}
      >
        {letter}
        <meshStandardMaterial
          color="#2f3a58"
          metalness={0.34}
          roughness={0.42}
        />
      </Text3D>

      <Text3D
        bevelEnabled
        bevelSegments={5}
        bevelSize={0.03}
        bevelThickness={0.05}
        castShadow
        curveSegments={16}
        font={nmcFont}
        height={0.28}
        position={[0.06, -0.035, -0.12]}
        receiveShadow
        size={1.36}
      >
        {letter}
        <meshStandardMaterial
          color="#9b111e"
          emissive="#3f0208"
          emissiveIntensity={0.12}
          metalness={0.4}
          roughness={0.3}
        />
      </Text3D>

      <Text3D
        bevelEnabled
        bevelSegments={8}
        bevelSize={0.022}
        bevelThickness={0.035}
        castShadow
        curveSegments={20}
        font={nmcFont}
        height={0.22}
        receiveShadow
        size={1.36}
      >
        {letter}
        <meshPhysicalMaterial
          clearcoat={0.72}
          clearcoatRoughness={0.18}
          color="#06134f"
          emissive="#02072b"
          emissiveIntensity={0.1}
          metalness={0.26}
          roughness={0.2}
        />
      </Text3D>
    </group>
  );
}

function GlossySphere({
  position,
  scale = 1,
}: {
  position: VectorTuple;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.18, 32, 18]} />
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.04}
          color="#f8fafc"
          metalness={0.16}
          roughness={0.08}
        />
      </mesh>
      <mesh scale={[1.04, 0.28, 1.04]}>
        <sphereGeometry args={[0.181, 32, 12]} />
        <meshStandardMaterial
          color="#020617"
          metalness={0.18}
          roughness={0.18}
        />
      </mesh>
      <mesh position={[-0.03, 0.055, 0.16]} rotation={[0, 0, -0.12]}>
        <boxGeometry args={[0.28, 0.035, 0.018]} />
        <meshStandardMaterial color="#ffffff" roughness={0.18} />
      </mesh>
    </group>
  );
}

function FacetedDiamond() {
  return (
    <group position={[2.65, 0.66, 0.06]} rotation={[0.18, 0.2, 0.62]}>
      <mesh castShadow>
        <octahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial
          color="#030712"
          metalness={0.45}
          roughness={0.24}
        />
      </mesh>
    </group>
  );
}

function TealOrnament({
  position,
  flip = 1,
}: {
  position: VectorTuple;
  flip?: 1 | -1;
}) {
  return (
    <group position={position} scale={[flip, 1, 1]} rotation={[0, 0, -0.08]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.38, 10]} />
        <meshStandardMaterial
          color="#0f766e"
          emissive="#0e7490"
          emissiveIntensity={0.18}
          metalness={0.25}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.27, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.12, 0.28, 4]} />
        <meshStandardMaterial
          color="#0e7490"
          metalness={0.24}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, -0.27, 0]}>
        <coneGeometry args={[0.12, 0.28, 4]} />
        <meshStandardMaterial
          color="#0e7490"
          metalness={0.24}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0.17, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.24, 4]} />
        <meshStandardMaterial
          color="#115e59"
          metalness={0.24}
          roughness={0.32}
        />
      </mesh>
    </group>
  );
}

function NutmakchinePlaque() {
  return (
    <group position={[0.2, -1.35, 0.18]} rotation={[0, 0, 0.015]}>
      <RoundedBox
        args={[3.95, 0.48, 0.18]}
        castShadow
        radius={0.07}
        receiveShadow
      >
        <meshPhysicalMaterial
          clearcoat={0.42}
          color="#e5e7eb"
          metalness={0.16}
          roughness={0.28}
        />
      </RoundedBox>
      <RoundedBox
        args={[3.58, 0.08, 0.045]}
        position={[0.02, 0.27, 0.08]}
        radius={0.025}
      >
        <meshStandardMaterial
          color="#111827"
          metalness={0.2}
          roughness={0.34}
        />
      </RoundedBox>
      <Text3D
        bevelEnabled
        bevelSegments={3}
        bevelSize={0.009}
        bevelThickness={0.012}
        castShadow
        curveSegments={8}
        font={nmcFont}
        height={0.045}
        position={[-1.55, -0.13, 0.14]}
        size={0.235}
      >
        NUTMAKCHINE
        <meshPhysicalMaterial
          clearcoat={0.5}
          color="#0891b2"
          emissive="#0e7490"
          emissiveIntensity={0.18}
          metalness={0.22}
          roughness={0.22}
        />
      </Text3D>
      <TealOrnament position={[-2.12, -0.02, 0.02]} />
      <TealOrnament flip={-1} position={[2.12, -0.02, 0.02]} />
    </group>
  );
}

function NmcLogoV2() {
  const logoRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const viewportWidth = useThree((state) => state.viewport.width);
  const [isHovered, setIsHovered] = useState(false);
  const fitScale = Math.min(0.84, viewportWidth / 6.6);

  useFrame(({ pointer }, delta) => {
    const logo = logoRef.current;

    if (!logo) {
      return;
    }

    elapsedRef.current += delta;

    const elapsed = elapsedRef.current;
    const targetScale = fitScale * (isHovered ? 1.045 : 1);
    const nextScale = MathUtils.lerp(logo.scale.x, targetScale, delta * 5);

    logo.position.y = Math.sin(elapsed * 1.05) * 0.055;
    logo.rotation.x = MathUtils.lerp(
      logo.rotation.x,
      0.08 + Math.sin(elapsed * 0.7) * 0.025 + pointer.y * 0.035,
      delta * 3,
    );
    logo.rotation.y = MathUtils.lerp(
      logo.rotation.y,
      -0.28 + pointer.x * 0.075,
      delta * 3,
    );
    logo.rotation.z = MathUtils.lerp(
      logo.rotation.z,
      -0.015 - pointer.x * 0.025,
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
      <group position={[-0.18, 0.16, 0]}>
        <LayeredLetter letter="N" position={[-2.34, -0.08, 0]} />
        <LayeredLetter
          letter="M"
          position={[-0.94, -0.16, 0.02]}
          scale={[1.15, 1.18, 1]}
        />
        <LayeredLetter
          letter="C"
          position={[1.05, -0.08, 0]}
          scale={[1.05, 1, 1]}
        />

        <GlossySphere position={[-2.55, 0.34, 0.34]} scale={0.86} />
        <GlossySphere position={[-0.3, 0.88, 0.36]} scale={0.78} />
        <FacetedDiamond />
        <NutmakchinePlaque />
      </group>
    </group>
  );
}

const logoVersions = {
  v1: NmcLogoV1,
  v2: NmcLogoV2,
};

const ActiveLogo = logoVersions.v2;

export default function ShipScene() {
  return (
    <div aria-label="Interactive 3D NMC logo" className="h-dvh w-full">
      <Canvas
        camera={{ fov: 38, position: [0, 0.2, 7.7] }}
        dpr={[1, 2]}
        gl={{ alpha: false, antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl, scene }) => {
          const background = new Color("#9fb2ad");

          gl.setClearColor(background, 1);
          scene.background = background;
        }}
        shadows
        className="flex flex-1 flex-col w-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={["#9fb2ad"]} />
        <fog attach="fog" args={["#9fb2ad", 7.5, 14]} />
        <ambientLight intensity={0.58} />
        <directionalLight
          castShadow
          intensity={2.65}
          position={[3.4, 4.8, 5]}
        />
        <pointLight
          color="#22d3ee"
          intensity={1.85}
          position={[-3.1, 1.6, 2.8]}
        />
        <pointLight
          color="#fecaca"
          intensity={1.45}
          position={[-4.1, 0.6, 3.2]}
        />
        <Suspense fallback={null}>
          <Environment preset="studio" />
        </Suspense>
        <Suspense fallback={null}>
          <ActiveLogo />
        </Suspense>
        <mesh
          position={[0, -1.68, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[9, 5.2]} />
          <shadowMaterial opacity={0.14} />
        </mesh>
        <ContactShadows
          blur={3.2}
          far={4}
          opacity={0.34}
          position={[0, -1.62, 0]}
          scale={8.5}
        />
        <OrbitControls
          dampingFactor={0.08}
          enableDamping
          enablePan={false}
          maxAzimuthAngle={Math.PI / 3}
          maxDistance={10}
          maxPolarAngle={Math.PI / 1.72}
          minAzimuthAngle={-Math.PI / 3}
          minDistance={5.8}
          minPolarAngle={Math.PI / 3.25}
          rotateSpeed={0.68}
          target={[0, -0.2, 0]}
          zoomSpeed={0.54}
        />
      </Canvas>
    </div>
  );
}
