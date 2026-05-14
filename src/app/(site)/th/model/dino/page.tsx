"use client";

import dynamic from "next/dynamic";

const PrototypeModelScene = dynamic(
  () => import("@/components/model-viewer/PrototypeModelScene"),
  {
    loading: function PrototypeModelSceneFallback() {
      return <main aria-hidden="true" className="h-dvh w-full bg-[#050816]" />;
    },
    ssr: false,
  },
);

export default function DinoModelPage() {
  return <PrototypeModelScene model="dino" />;
}
