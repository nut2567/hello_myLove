import { FeatureGrid } from "@/components/home/feature-grid";
import { HeroSection } from "@/components/home/hero-section";
import { WorkspaceSection } from "@/components/home/workspace-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <WorkspaceSection />
    </>
  );
}
