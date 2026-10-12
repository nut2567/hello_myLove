
import { TranslatedText } from "@/components/translated-text";

import { v2FileSections } from "../structure-data";
import { SectionHeading } from "../structure-ui";

export function RobotV2FileSection() {
  return (
    <>
          
                    <div className="mt-14">
                      <SectionHeading
                        eyebrow="Structure.v2FullFile"
                        title="Structure.whatRobotDragGameV2TsxDoes"
                      ><TranslatedText messageKey={"Structure.thisFullScreen3DGameLetsPlayersDragRobotsTo"} /></SectionHeading>
          
                      <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {v2FileSections.map((item) => (
                          <article
                            key={item.name}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <h3 className="font-mono text-sm font-semibold text-accent">
                              <TranslatedText messageKey={item.name} />
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-foreground">
                              <TranslatedText messageKey={item.role} />
                            </p>
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
