import type { ThreeEvent } from "@react-three/fiber";

export type RobotId = "bolt" | "chip" | "byte" | "nix" | "pixel";
export type DinosaurId = "rex" | "nova";
export type Difficulty = "easy" | "medium" | "hard";

export type RobotConfig = {
  id: RobotId;
  name: string;
  primary: string;
  secondary: string;
  emissive: string;
  phase: number;
};

export type RobotState = {
  x: number;
  z: number;
  yaw: number;
  captured: boolean;
  removed: boolean;
};

export type RobotStates = Record<RobotId, RobotState>;

export type RobotMotion = {
  vx: number;
  vz: number;
  changeAt: number;
  pauseUntil: number;
};

export type RobotMotions = Record<RobotId, RobotMotion>;

export type TargetPoint = {
  x: number;
  z: number;
};

export type DinosaurState = TargetPoint & {
  yaw: number;
};

export type DinosaurStates = Record<DinosaurId, DinosaurState>;

export type DinosaurMotion = {
  vx: number;
  vz: number;
  changeAt: number;
  pauseUntil: number;
};

export type DinosaurMotions = Record<DinosaurId, DinosaurMotion>;

export type DragSession =
  | {
      kind: "robot";
      id: RobotId;
      offsetX: number;
      offsetZ: number;
    }
  | {
      kind: "dinosaur";
      id: DinosaurId;
      offsetX: number;
      offsetZ: number;
    };

export type DifficultySettings = {
  label: string;
  speed: number;
  targetRadius: number;
  alwaysVisible: boolean;
  flashDuration: [number, number];
  flashInterval: [number, number];
  nearRevealDistance: number;
};

export type ModelPointerHandler = (event: ThreeEvent<PointerEvent>) => void;
