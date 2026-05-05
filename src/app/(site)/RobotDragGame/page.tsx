"use client";

import dynamic from "next/dynamic";

const RobotDragGame = dynamic(() => import("@/components/RobotDragGame"), {
  loading: function RobotDragGameFallback() {
    return <main className="h-dvh w-full bg-black" />;
  },
  ssr: false,
});

export default function RobotDragGamePage() {
  return <RobotDragGame />;
}
