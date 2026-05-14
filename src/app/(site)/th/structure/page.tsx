import { HeroSection } from "./hero-section";
import { RobotV2Section } from "./robot-v2-section";
import { RoutesSection } from "./routes-section";
import { StackSection } from "./stack-section";
import { WorkspaceSection } from "./workspace-section";

export default function StructurePage() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />
      <StackSection />
      <RoutesSection />
      <RobotV2Section />
      <WorkspaceSection />
    </div>
  );
}
