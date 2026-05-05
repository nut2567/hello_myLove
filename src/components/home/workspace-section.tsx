import { workspaceTree } from "@/lib/site";

export function WorkspaceSection() {
  return (
    <section className="bg-muted">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.8fr_1fr] lg:items-start">
        <div>
          <p className="text-sm font-medium uppercase text-accent">
            Workspace
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground">
            A cleaner foundation for the next feature.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Tailwind 4 is configured through CSS-first theme tokens, while
            Next 16 keeps App Router conventions and Turbopack defaults.
          </p>
        </div>

        <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-6 text-sm leading-7 text-foreground shadow-soft">
          <code>{workspaceTree}</code>
        </pre>
      </div>
    </section>
  );
}
