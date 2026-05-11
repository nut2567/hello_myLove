import type {
  Difficulty,
  DifficultySettings,
  RobotConfig,
  TargetPoint,
} from "@/components/robot-drag-game/V2/types";

export const ARENA_WIDTH = 10;
export const ARENA_DEPTH = 10;
export const HALF_WIDTH = ARENA_WIDTH / 2;
export const HALF_DEPTH = ARENA_DEPTH / 2;
export const ROBOT_RADIUS = 0.42;
export const DINOSAUR_RADIUS = 0.46;
export const ROBOT_MODEL_SCALE = 0.62;
export const ROBOT_COUNT = 5;

export const robotConfigs: RobotConfig[] = [
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

export const difficulties: Record<Difficulty, DifficultySettings> = {
  easy: {
    label: "Easy",
    speed: 0.62,
    targetRadius: 0.3,
    alwaysVisible: true,
    flashDuration: [900, 1300],
    flashInterval: [1800, 2600],
    nearRevealDistance: 1.8,
  },
  medium: {
    label: "Medium",
    speed: 0.88,
    targetRadius: 0.2,
    alwaysVisible: false,
    flashDuration: [650, 950],
    flashInterval: [2600, 4300],
    nearRevealDistance: 1.45,
  },
  hard: {
    label: "Hard",
    speed: 1.18,
    targetRadius: 0.2,
    alwaysVisible: false,
    flashDuration: [180, 320],
    flashInterval: [4600, 7200],
    nearRevealDistance: 1.1,
  },
};

export const difficultyOrder: Difficulty[] = ["easy", "medium", "hard"];

export function getDockPoint(index: number): TargetPoint {
  const gap = 0.95;
  const start = -((ROBOT_COUNT - 1) * gap) / 2;

  return {
    x: start + index * gap,
    z: HALF_DEPTH - 0.55,
  };
}
