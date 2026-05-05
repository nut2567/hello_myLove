import { FeatureGrid } from "@/components/home/feature-grid";
import { HeroSection } from "@/components/home/hero-section";
import { WorkspaceSection } from "@/components/home/workspace-section";
import { SiteShell } from "@/components/layout/site-shell";

export default function Home() {
  return (
    <SiteShell>
      <HeroSection />
      <FeatureGrid />
      <WorkspaceSection />
    </SiteShell>
  );
}
