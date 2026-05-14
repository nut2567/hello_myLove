"use client";

import dynamic from "next/dynamic";

const ShipScene = dynamic(() => import("@/components/ShipScene"), {
  loading: function ShipSceneFallback() {
    return <div aria-hidden="true" className="h-dvh w-full" />;
  },
  ssr: false,
});

export default function ModelLogoPage() {
  return <ShipScene />;
}
