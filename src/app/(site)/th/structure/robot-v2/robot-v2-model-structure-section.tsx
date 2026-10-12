
import { TranslatedText } from "@/components/translated-text";

import { InlineCode } from "../structure-ui";

export function RobotV2ModelStructureSection() {
  return (
    <>
                    <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-normal text-foreground"><TranslatedText messageKey={"Structure.insideRobotModel"} /></h3>
                        <p className="mt-4 text-base leading-7 text-muted-foreground">
                          <InlineCode>RobotModel</InlineCode><TranslatedText messageKey={"Structure.receives"} before=" " />{" "}
                          <InlineCode>config</InlineCode><TranslatedText messageKey={"Structure.forColorsAndNames"} before=" " />{" "}
                          <InlineCode>state</InlineCode><TranslatedText messageKey={"Structure.forPositionAndRescueStatus"} before=" " /><InlineCode>isDragging</InlineCode><TranslatedText messageKey={"Structure.forDraggingStateAnd"} before=" " after=" " /><InlineCode>onPointerDown</InlineCode><TranslatedText messageKey={"Structure.toStartDragging"} before=" " /></p>
                        <p className="mt-4 text-base leading-7 text-muted-foreground"><TranslatedText messageKey={"Structure.theJSXUses"} after=" " /><InlineCode>{"<group>"}</InlineCode>{" "}<TranslatedText messageKey={"Structure.toWrapTheRobotAndPlaces"} after=" " /><InlineCode>{"<mesh>"}</InlineCode>{" "}<TranslatedText messageKey={"Structure.partsInsideEachMeshHasItsOwnGeometryAndMaterial"} />{" "}
                          <InlineCode>position</InlineCode>, <InlineCode>rotation</InlineCode><TranslatedText messageKey={"Structure.geometryAndMaterialForThatPart"} /></p>
                      </div>
          
                      <div className="rounded-lg border border-border bg-surface p-5 shadow-soft">
                        <h3 className="text-lg font-semibold text-foreground"><TranslatedText messageKey={"Structure.frequentlyEditedParts"} /></h3>
                        <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
                          <li>
                            <InlineCode>boxGeometry args={[0.5, 0.58, 0.38]}</InlineCode>{" "}<TranslatedText messageKey={"Structure.setsTheBodySize"} /></li>
                          <li>
                            <InlineCode>boxGeometry args={[0.62, 0.42, 0.48]}</InlineCode>{" "}<TranslatedText messageKey={"Structure.setsTheHeadSize"} /></li>
                          <li>
                            <InlineCode>sphereGeometry args={[0.045, 16, 12]}</InlineCode>{" "}<TranslatedText messageKey={"Structure.setsTheEyeSize"} /></li>
                          <li>
                            <InlineCode>cylinderGeometry args={[0.025, 0.025, 0.28, 12]}</InlineCode>{" "}<TranslatedText messageKey={"Structure.setsTheAntenna"} /></li>
                          <li>
                            <InlineCode>group.scale</InlineCode><TranslatedText messageKey={"Structure.and"} before=" " />{" "}
                            <InlineCode>group.position.y</InlineCode>{" "}<TranslatedText messageKey={"Structure.in2"} after=" " /><InlineCode>useFrame</InlineCode><TranslatedText messageKey={"Structure.controlDraggingAndRescueAnimations"} before=" " /></li>
                        </ul>
                      </div>
                    </div>
    </>
  );
}
