
import { TranslatedText } from "@/components/translated-text";

import { v2TypeMap } from "../structure-data";
import { SectionHeading } from "../structure-ui";

export function RobotV2TypesSection() {
  return (
    <>
          
                    <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                      <SectionHeading
                        eyebrow="Structure.types"
                        title="Structure.typescriptTypesAtTheTopOfTheFile"
                      ><TranslatedText messageKey={"Structure.theseTypesDefineTheGameDataContractSoConfigurationState"} /></SectionHeading>
          
                      <div className="grid gap-3">
                        {v2TypeMap.map((item) => (
                          <article
                            key={item.name}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <h3 className="font-mono text-sm font-semibold text-accent">
                              <TranslatedText messageKey={item.name} />
                            </h3>
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
