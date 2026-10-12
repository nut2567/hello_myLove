
import { TranslatedText } from "@/components/translated-text";

import { v2FunctionMap } from "../structure-data";
import { SectionHeading } from "../structure-ui";

export function RobotV2FunctionsSection() {
  return (
    <>
                    <div className="mt-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                      <SectionHeading
                        eyebrow="Structure.v2Functions"
                        title="Structure.functionMapForRobotDragGameV2Tsx"
                      ><TranslatedText messageKey={"Structure.thisSectionExplainsWhereToEditV2SeparatingModelRendering"} /></SectionHeading>
          
                      <div className="grid gap-3">
                        {v2FunctionMap.map((item) => (
                          <article
                            key={item.name}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <h3 className="font-mono text-sm font-semibold text-accent">
                                <TranslatedText messageKey={item.name} />
                              </h3>
                              <p className="text-sm font-semibold text-foreground">
                                <TranslatedText messageKey={item.role} />
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
