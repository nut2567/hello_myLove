"use client";

import dynamic from "next/dynamic";

import { ModelBackLink } from "@/components/model-viewer/model-back-link";

const ShipScene = dynamic(() => import("@/components/ShipScene"), {
  loading: function ShipSceneFallback() {
    return <div aria-hidden="true" className="h-dvh w-full" />;
  },
  ssr: false,
});

export default function ModelLogoPage() {
  return (
    <div className="relative">
      <ModelBackLink />
      <ShipScene />
    </div>
  );
}
