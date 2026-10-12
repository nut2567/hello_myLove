
import { TranslatedText } from "@/components/translated-text";

import { v2RefMap, v2StateMap } from "../structure-data";
import { InlineCode } from "../structure-ui";

export function RobotV2StateRefSection() {
  return (
    <>
          
                    <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1fr]">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-normal text-foreground"><TranslatedText messageKey={"Structure.stateInRobotDragGameV2"} /></h3>
                        <div className="mt-6 grid gap-3">
                          {v2StateMap.map((item) => (
                            <article
                              key={item.name}
                              className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                            >
                              <h4 className="font-mono text-sm font-semibold text-accent">
                                <TranslatedText messageKey={item.name} />
                              </h4>
                              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                <TranslatedText messageKey={item.detail} />
                              </p>
                            </article>
                          ))}
                        </div>
                      </div>
          
                      <div>
                        <h3 className="text-2xl font-semibold tracking-normal text-foreground"><TranslatedText messageKey={"Structure.refsInRobotArena"} /></h3>
                        <p className="mt-4 text-base leading-7 text-muted-foreground">
                          <InlineCode>RobotArena</InlineCode><TranslatedText messageKey={"Structure.refsAreUsedExtensivelyBecauseTheMainLogicRunsIn"} before=" " after=" " /><InlineCode>useFrame</InlineCode><TranslatedText messageKey={"Structure.everyFrameReadingRefsGivesTheAnimationLoopCurrentValues"} before=" " /></p>
                        <div className="mt-6 grid gap-3">
                          {v2RefMap.map((item) => (
                            <article
                              key={item.name}
                              className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                            >
                              <h4 className="font-mono text-sm font-semibold text-accent">
                                <TranslatedText messageKey={item.name} />
                              </h4>
                              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                <TranslatedText messageKey={item.detail} />
                              </p>
                            </article>
                          ))}
                        </div>
                      </div>
                    </div>
    </>
  );
}
