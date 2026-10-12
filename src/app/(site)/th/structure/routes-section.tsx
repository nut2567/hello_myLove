
import { TranslatedText } from "@/components/translated-text";

import { routes } from "./structure-data";
import { InlineCode, SectionHeading } from "./structure-ui";

export function RoutesSection() {
  return (
    <section className="border-b border-border bg-muted">
            <div className="container mx-auto grid gap-8 px-6 py-14 lg:grid-cols-[0.85fr_1fr] lg:items-start">
              <SectionHeading eyebrow="Structure.routes" title="Structure.mainApplicationRoutes"><TranslatedText messageKey={"Structure.theExistingRoutesAreUnder"} after=" " /><InlineCode>/th</InlineCode><TranslatedText messageKey={"Structure.andGameRoutesUseDynamicImportsToLoadOnlyIn"} before=" " /></SectionHeading>
    
              <div className="grid gap-3">
                {routes.map((route) => (
                  <article
                    key={route.path}
                    className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="font-mono text-sm font-semibold text-accent">
                        {route.path}
                      </h3>
                      <p className="break-all font-mono text-xs text-muted-foreground">
                        {route.file}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      <TranslatedText messageKey={route.detail} />
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
  );
}
