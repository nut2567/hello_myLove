"use client";

import Link from "next/link";
import { useState } from "react";

import RobotDragGameV1 from "@/components/RobotDragGameV1";
import RobotDragGameV2 from "@/components/RobotDragGameV2";

type RobotDragGameVersion = "v1" | "v2";

const versions: RobotDragGameVersion[] = ["v1", "v2"];

export default function RobotDragGame() {
  const [version, setVersion] = useState<RobotDragGameVersion>("v2");
  const SelectedGame = version === "v1" ? RobotDragGameV1 : RobotDragGameV2;

  return (
    <>
      <SelectedGame key={version} />

      <div
        className="fixed bottom-4 right-4 flex gap-1 rounded-lg border border-white/15 bg-slate-950/82 p-1 shadow-2xl backdrop-blur"
        style={{ pointerEvents: "auto", zIndex: 1000 }}
      >
        <Link
          className="rounded-md bg-white px-3 py-2 text-sm font-bold tracking-normal text-slate-950 transition hover:bg-cyan-100"
          href="/th/heart"
        >
          Exit
        </Link>
        {versions.map((versionOption) => (
          <button
            key={versionOption}
            className={[
              "rounded-md px-3 py-2 text-sm font-bold uppercase tracking-normal transition",
              version === versionOption
                ? "bg-cyan-300 text-slate-950"
                : "bg-white/10 text-white hover:bg-white/18",
            ].join(" ")}
            onClick={() => setVersion(versionOption)}
            type="button"
          >
            {versionOption}
          </button>
        ))}
      </div>
    </>
  );
}
