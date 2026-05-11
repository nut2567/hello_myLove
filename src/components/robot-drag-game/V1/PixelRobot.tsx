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
