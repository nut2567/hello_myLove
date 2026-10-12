
import { TranslatedText } from "@/components/translated-text";

import { v2ModelEditNotes } from "../structure-data";
import { InlineCode, SectionHeading } from "../structure-ui";

export function RobotV2ModelSection() {
  return (
    <>
          
                    <div className="mt-14">
                      <SectionHeading
                        eyebrow="Structure.v2Model"
                        title="Structure.whichFunctionToEditForModelChanges"
                      ><TranslatedText messageKey={"Structure.theMainEntryIs"} after=" " /><InlineCode>function RobotModel</InlineCode><TranslatedText messageKey={"Structure.in"} before=" " />{" "}
                        <InlineCode>src/components/robot-drag-game/V2/RobotDragGameV2.tsx</InlineCode>{" "}<TranslatedText messageKey={"Structure.whichRendersEveryPartOfThe3DRobotWhile"} />{" "}
                        <InlineCode>RobotArena</InlineCode><TranslatedText messageKey={"Structure.controlsGameplayAndPassesStateToTheModel"} before=" " /></SectionHeading>
          
                      <div className="mt-8 grid gap-4 lg:grid-cols-2">
                        {v2ModelEditNotes.map((item) => (
                          <article
                            key={item.title}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <p className="text-sm font-semibold text-accent">
                              <TranslatedText messageKey={item.title} />
                            </p>
                            <h3 className="mt-3 font-mono text-sm font-semibold text-foreground">
                              <TranslatedText messageKey={item.target} />
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                              <TranslatedText messageKey={item.detail} />
                            </p>
                          </article>
                        ))}
                      </div>
          
                      <div className="mt-8 rounded-lg border border-cyan-200/30 bg-cyan-300/10 p-5">
                        <h3 className="text-lg font-semibold text-foreground"><TranslatedText messageKey={"Structure.quickGuide"} /></h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground"><TranslatedText messageKey={"Structure.toChangeTheRobotSAppearanceSuchAsItsHead"} />{" "}
                          <InlineCode>RobotModel</InlineCode><TranslatedText messageKey={"Structure.toChangeMovementDraggingOrRescueBehaviorEdit"} />{" "}
                          <InlineCode>RobotArena</InlineCode><TranslatedText messageKey={"Structure.andTheConstantsAtTheTopOfTheFile"} before=" " /></p>
                      </div>
                    </div>
          
    </>
  );
}
