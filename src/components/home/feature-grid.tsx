import { projectPillars } from "@/lib/site";

export function FeatureGrid() {
  return (
    <section id="structure" className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase text-accent">
            Structure
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground">
            Organized for App Router work.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Routes stay focused on routing, reusable UI lives in components, and
            shared content/configuration lives in `src/lib`.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {projectPillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-lg border border-border bg-surface p-6 shadow-soft"
            >
              <p className="text-sm font-medium text-accent">{pillar.kicker}</p>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
