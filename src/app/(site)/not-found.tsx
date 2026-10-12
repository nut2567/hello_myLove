
import { TranslatedText } from "@/components/translated-text";

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center border-b border-border bg-background py-16">
      <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.8fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-accent"><TranslatedText messageKey={"Common.privatePath"} /></p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl"><TranslatedText messageKey={"Common.accessPathNotFound"} /></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground"><TranslatedText messageKey={"Common.thisPageDoesNotExistCustomPathsMustNotStart"} /></p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="/"
            ><TranslatedText messageKey={"Common.enterPathAgain"} /></Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="/th/structure"
            ><TranslatedText messageKey={"Common.viewStructure"} /></Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-soft">
          <div className="grid gap-3 font-mono text-sm text-muted-foreground">
            <div className="rounded-md border border-border bg-muted p-4">
              <span className="text-accent">status</span>: 404
            </div>
            <div className="rounded-md border border-border bg-muted p-4">
              <span className="text-accent">scope</span>: [[...slug]]
            </div>
            <div className="rounded-md border border-border bg-muted p-4">
              <span className="text-accent">source</span>: port.user
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
