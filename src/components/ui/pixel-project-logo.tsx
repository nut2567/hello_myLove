"use client";

import { motion, type Transition } from "framer-motion";

import { PixelRobot } from "@/components/robot-drag-game/V1/PixelRobot";

type PixelProjectLogoProps = {
  name: string;
};

const LOGO_LOOP_DURATION_S = 8.2;

const textLoopTransition: Transition = {
  duration: LOGO_LOOP_DURATION_S,
  ease: "easeInOut",
  delay: 0.5,
  repeat: Infinity,
  times: [0, 0.22, 0.28, 0.78, 1],
};

const bitLoopTransition: Transition = {
  duration: LOGO_LOOP_DURATION_S,
  ease: "linear",
  repeat: Infinity,
  times: [0, 0.22, 0.28, 0.78, 1],
};

export function PixelProjectLogo({ name }: PixelProjectLogoProps) {
  return (
    <span aria-hidden="true" className="pixel-project-logo">
      <motion.span
        animate={{
          opacity: [0, 0, 1, 1, 0],
        }}
        className="pixel-project-logo-icon-stage"
        transition={bitLoopTransition}
      >
        <motion.span
          animate={{
            x: ["-7.75rem", "-7.75rem", "-7.75rem", "7.75rem", "7.75rem"],
          }}
          className="pixel-project-logo-runner"
          transition={bitLoopTransition}
        >
          <span className="pixel-project-logo-robot">
            <PixelRobot
              accentClassName="bg-cyan-300"
              isDragging={false}
              isMoving
              name="Pixel"
            />
          </span>
        </motion.span>
      </motion.span>
      <motion.span
        animate={{
          opacity: [1, 1, 0, 0, 1],
          x: ["0rem", "11rem", "11rem", "11rem", "0rem"],
        }}
        className="pixel-project-logo-name"
        transition={textLoopTransition}
      >
        {name}
      </motion.span>
    </span>
  );
}
