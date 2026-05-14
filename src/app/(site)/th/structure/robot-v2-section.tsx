import { RobotV2ConstantsSection } from "./robot-v2/robot-v2-constants-section";
import { RobotV2FileSection } from "./robot-v2/robot-v2-file-section";
import { RobotV2FunctionsSection } from "./robot-v2/robot-v2-functions-section";
import { RobotV2HelpersSection } from "./robot-v2/robot-v2-helpers-section";
import { RobotV2ModelSection } from "./robot-v2/robot-v2-model-section";
import { RobotV2ModelStructureSection } from "./robot-v2/robot-v2-model-structure-section";
import { RobotV2NestedFunctionsSection } from "./robot-v2/robot-v2-nested-functions-section";
import { RobotV2Overview } from "./robot-v2/robot-v2-overview";
import { RobotV2StateRefSection } from "./robot-v2/robot-v2-state-ref-section";
import { RobotV2TypesSection } from "./robot-v2/robot-v2-types-section";

export function RobotV2Section() {
  return (
    <section id="robot-v2" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <RobotV2Overview />
        <RobotV2FileSection />
        <RobotV2TypesSection />
        <RobotV2ConstantsSection />
        <RobotV2ModelSection />
        <RobotV2FunctionsSection />
        <RobotV2ModelStructureSection />
        <RobotV2HelpersSection />
        <RobotV2NestedFunctionsSection />
        <RobotV2StateRefSection />
      </div>
    </section>
  );
}
