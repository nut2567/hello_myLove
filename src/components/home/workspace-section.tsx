
import { TranslatedText } from "@/components/translated-text";

import { workspaceTree } from "@/lib/site";

export function WorkspaceSection() {
  return (
    <section className="bg-muted">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.8fr_1fr] lg:items-start">
        <div>
          <p className="text-sm font-medium uppercase text-accent"><TranslatedText messageKey={"Structure.workspace"} /></p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground"><TranslatedText messageKey={"Home.aCleanerFoundationForTheNextFeature"} /></h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground"><TranslatedText messageKey={"Home.tailwind4IsConfiguredThroughCSSFirstThemeTokensWhile"} /></p>
        </div>

        <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-6 text-sm leading-7 text-foreground shadow-soft">
          <code>{workspaceTree}</code>
        </pre>
      </div>
    </section>
  );
}
