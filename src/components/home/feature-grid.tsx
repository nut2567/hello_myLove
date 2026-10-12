
import { TranslatedText } from "@/components/translated-text";

import { projectPillars } from "@/lib/site";

export function FeatureGrid() {
  return (
    <section id="structure" className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase text-accent"><TranslatedText messageKey={"Navigation.structure"} /></p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground"><TranslatedText messageKey={"Home.organizedForAppRouterWork"} /></h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground"><TranslatedText messageKey={"Home.routesStayFocusedOnRoutingReusableUILivesInComponents"} /></p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {projectPillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-lg border border-border bg-surface p-6 shadow-soft"
            >
              <p className="text-sm font-medium text-accent"><TranslatedText messageKey={pillar.kicker} /></p>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                <TranslatedText messageKey={pillar.title} />
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                <TranslatedText messageKey={pillar.description} />
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
