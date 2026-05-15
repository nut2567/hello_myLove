"use client";

import dynamic from "next/dynamic";

import { ModelBackLink } from "@/components/model-viewer/model-back-link";

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
  return (
    <div className="relative">
      <ModelBackLink />
      <PrototypeModelScene model="dino" />
    </div>
  );
}
