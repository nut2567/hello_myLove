type PixelRobotProps = {
  accentClassName: string;
  isDragging: boolean;
  isMoving: boolean;
  name: string;
};

export function PixelRobot({
  accentClassName,
  isDragging,
  isMoving,
  name,
}: PixelRobotProps) {
  const motionState = isDragging ? "drag" : isMoving ? "walk" : "idle";

  return (
    <div
      aria-label={`${name} robot`}
      className={[
        "pixel-robot relative h-12 w-12 select-none",
        isDragging ? "scale-110" : "scale-100",
      ].join(" ")}
      data-motion={motionState}
    >
      <style>
        {`
          @keyframes pixelRobotWalkBody {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-3px) rotate(-2deg); }
          }

          @keyframes pixelRobotWriggleBody {
            0%, 100% { transform: translate(0, 0) rotate(-5deg); }
            25% { transform: translate(-2px, 1px) rotate(7deg); }
            50% { transform: translate(2px, -1px) rotate(-8deg); }
            75% { transform: translate(-1px, -2px) rotate(6deg); }
          }

          @keyframes pixelRobotLeftStep {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }

          @keyframes pixelRobotRightStep {
            0%, 100% { transform: translateY(-4px); }
            50% { transform: translateY(0); }
          }

          @keyframes pixelRobotLeftArm {
            0%, 100% { transform: translateY(-2px); }
            50% { transform: translateY(2px); }
          }

          @keyframes pixelRobotRightArm {
            0%, 100% { transform: translateY(2px); }
            50% { transform: translateY(-2px); }
          }

          .pixel-robot[data-motion="walk"] {
            animation: pixelRobotWalkBody 420ms steps(2, end) infinite;
            transform-origin: 50% 100%;
          }

          .pixel-robot[data-motion="drag"] {
            animation: pixelRobotWriggleBody 260ms steps(2, end) infinite;
            transform-origin: 50% 50%;
          }

          .pixel-robot[data-motion="walk"] .pixel-robot-left-leg {
            animation: pixelRobotLeftStep 420ms steps(2, end) infinite;
          }

          .pixel-robot[data-motion="walk"] .pixel-robot-right-leg {
            animation: pixelRobotRightStep 420ms steps(2, end) infinite;
          }

          .pixel-robot[data-motion="walk"] .pixel-robot-left-arm {
            animation: pixelRobotLeftArm 420ms steps(2, end) infinite;
          }

          .pixel-robot[data-motion="walk"] .pixel-robot-right-arm {
            animation: pixelRobotRightArm 420ms steps(2, end) infinite;
          }

          .pixel-robot[data-motion="drag"] .pixel-robot-left-arm,
          .pixel-robot[data-motion="drag"] .pixel-robot-right-arm,
          .pixel-robot[data-motion="drag"] .pixel-robot-left-leg,
          .pixel-robot[data-motion="drag"] .pixel-robot-right-leg {
            animation: pixelRobotWriggleBody 180ms steps(2, end) infinite;
          }
        `}
      </style>
      <div className="absolute left-1/2 top-0 h-2 w-5 -translate-x-1/2 bg-zinc-200" />
      <div className="absolute left-1/2 top-1 h-2 w-2 -translate-x-1/2 bg-red-400" />
      <div className="absolute left-1 top-3 h-7 w-10 border-4 border-zinc-100 bg-zinc-700">
        <div className="absolute left-2 top-2 h-2 w-2 bg-black" />
        <div className="absolute right-2 top-2 h-2 w-2 bg-black" />
        <div className="absolute bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 bg-zinc-200" />
      </div>
      <div
        className={`pixel-robot-left-arm absolute left-0 top-5 h-4 w-2 ${accentClassName}`}
      />
      <div
        className={`pixel-robot-right-arm absolute right-0 top-5 h-4 w-2 ${accentClassName}`}
      />
      <div
        className={`pixel-robot-left-leg absolute bottom-0 left-3 h-2 w-2 ${accentClassName}`}
      />
      <div
        className={`pixel-robot-right-leg absolute bottom-0 right-3 h-2 w-2 ${accentClassName}`}
      />
    </div>
  );
}
