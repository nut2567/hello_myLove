
import { TranslatedText } from "@/components/translated-text";

import { currentStack } from "./structure-data";
import { SectionHeading } from "./structure-ui";

export function StackSection() {
  return (
    <section className="border-b border-border">
            <div className="container mx-auto px-6 py-14">
              <SectionHeading eyebrow="Structure.stack" title="Structure.currentTechnologyStack"><TranslatedText messageKey={"Structure.theProjectUsesNextJsAppRouterThe3DGame"} /></SectionHeading>
    
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentStack.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.label}
                      </h3>
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                        {item.value}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      <TranslatedText messageKey={item.detail} />
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
  );
}
