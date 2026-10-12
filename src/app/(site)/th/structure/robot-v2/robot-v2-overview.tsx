
import { TranslatedText } from "@/components/translated-text";

import { robotGameFiles, v2Flow } from "../structure-data";
import { InlineCode, SectionHeading } from "../structure-ui";

export function RobotV2Overview() {
  return (
    <>
                    <SectionHeading
                      eyebrow="Navigation.robotGame"
                      title="Structure.currentV1AndV2GameStructure"
                    ><TranslatedText messageKey={"Structure.theMainFile"} after=" " /><InlineCode>RobotDragGame.tsx</InlineCode>{" "}<TranslatedText messageKey={"Structure.nowSelectsTheGameVersionKeepingBothTheOriginalAnd"} /></SectionHeading>
          
                    <div className="mt-8 grid gap-4 lg:grid-cols-3">
                    {robotGameFiles.map((item) => (
                        <article
                          key={item.file}
                          className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                        >
                          <p className="text-sm font-semibold text-accent"><TranslatedText messageKey={item.role} /></p>
                          <h3 className="mt-3 break-all font-mono text-sm font-semibold text-foreground">
                            {item.file}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            <TranslatedText messageKey={item.detail} />
                          </p>
                        </article>
                      ))}
                    </div>
          
                    <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-normal text-foreground"><TranslatedText messageKey={"Structure.whatIsReactThreeFiber"} /></h3>
                        <p className="mt-4 text-base leading-7 text-muted-foreground"><TranslatedText messageKey={"Structure.reactThreeFiberRendersThreeJsWithReactForExample"} after=" " /><InlineCode>{"<Canvas>"}</InlineCode><TranslatedText messageKey={"Structure.forThe3DScene"} before=" " after=" " /><InlineCode>{"<mesh>"}</InlineCode><TranslatedText messageKey={"Structure.forObjectsAnd"} before=" " />{" "}
                          <InlineCode>useFrame</InlineCode><TranslatedText messageKey={"Structure.toUpdateAnimationsEveryFrame"} before=" " /></p>
                        <p className="mt-4 text-base leading-7 text-muted-foreground"><TranslatedText messageKey={"Structure.in2"} after=" " /><InlineCode>RobotDragGameV2.tsx</InlineCode>{" "}<TranslatedText messageKey={"Structure.itConvertsThe2DDOMGameIntoWebGL3DWhile"} /></p>
                      </div>
          
                      <ol className="grid gap-3">
                        {v2Flow.map((item, index) => (
                          <li
                            key={item}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <div className="flex gap-4">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
                                {index + 1}
                              </span>
                              <p className="text-sm leading-6 text-muted-foreground">
                                <TranslatedText messageKey={item} />
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
    </>
  );
}
