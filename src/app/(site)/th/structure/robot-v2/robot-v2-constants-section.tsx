
import { TranslatedText } from "@/components/translated-text";

import { v2ConstantMap } from "../structure-data";

export function RobotV2ConstantsSection() {
  return (
    <>
          
                    <div className="mt-14">
                      <h3 className="text-2xl font-semibold tracking-normal text-foreground"><TranslatedText messageKey={"Structure.mainConstantsAndConfiguration"} /></h3>
                      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {v2ConstantMap.map((item) => (
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
    </>
  );
}
