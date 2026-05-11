import {
  ARENA_DEPTH,
  ARENA_WIDTH,
  HALF_DEPTH,
  HALF_WIDTH,
  getDockPoint,
  robotConfigs,
} from "@/components/robot-drag-game/V2/robotConfigs";

export function ArenaFloor({ capturedCount }: { capturedCount: number }) {
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
        args={[10, 100, "#38bdf8", "#1e293b"]}
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
