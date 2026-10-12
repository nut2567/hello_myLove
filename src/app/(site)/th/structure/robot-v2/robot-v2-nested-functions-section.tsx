
import { TranslatedText } from "@/components/translated-text";

import { v2NestedFunctionMap } from "../structure-data";
import { InlineCode } from "../structure-ui";

export function RobotV2NestedFunctionsSection() {
  return (
    <>
          
                    <div className="mt-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-normal text-foreground"><TranslatedText messageKey={"Structure.functionsInsideComponents"} /></h3>
                        <p className="mt-4 text-base leading-7 text-muted-foreground"><TranslatedText messageKey={"Structure.besidesTopLevelFunctionsSomeFunctionsAreDeclaredInside"} />{" "}
                          <InlineCode>RobotArena</InlineCode><TranslatedText messageKey={"Structure.and"} before=" " />{" "}
                          <InlineCode>RobotDragGameV2</InlineCode><TranslatedText messageKey={"Structure.theseDependOnComponentStateOrRefsSoTheyRemain"} /></p>
                      </div>
          
                      <div className="grid gap-3">
                        {v2NestedFunctionMap.map((item) => (
                          <article
                            key={item.name}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <h4 className="font-mono text-sm font-semibold text-accent">
                                <TranslatedText messageKey={item.name} />
                              </h4>
                              <p className="text-sm font-semibold text-foreground"><TranslatedText messageKey={"Structure.inside"} after=" " />{item.owner}
                              </p>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                              <TranslatedText messageKey={item.detail} />
                            </p>
                          </article>
                        ))}
                      </div>
                    </div>
    </>
  );
}
