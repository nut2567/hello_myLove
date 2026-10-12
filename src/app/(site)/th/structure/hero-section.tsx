
import { TranslatedText } from "@/components/translated-text";

import Link from "next/link";
import { InlineCode } from "./structure-ui";
import { updatedAt } from "./structure-data";

export function HeroSection() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="container mx-auto px-6 py-14 lg:py-18">
        <div className="max-w-4xl">
          <p className="inline-flex rounded-md border border-accent/25 bg-accent/10 px-3 py-1 text-sm font-semibold text-accent"><TranslatedText messageKey={"Structure.lastUpdated"} after=" " /><TranslatedText messageKey={updatedAt} />
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl"><TranslatedText messageKey={"Structure.currentHelloMyLoveStructure"} /></h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground"><TranslatedText messageKey={"Structure.thisPageDescribesTheCurrentProjectEspeciallyThe"} />{" "}
            <InlineCode>RobotDragGame</InlineCode><TranslatedText messageKey={"Structure.gameWhichKeepsTheOriginalVersionAs"} before=" " after=" " /><InlineCode>v1</InlineCode><TranslatedText messageKey={"Structure.andAddsANew3DVersionAs"} before=" " />{" "}
            <InlineCode>v2</InlineCode>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
              href="/th/RobotDragGame"
            ><TranslatedText messageKey={"Structure.openRobotDragGame"} /></Link>
            <a
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-muted"
              href="#robot-v2"
            ><TranslatedText messageKey={"Structure.readAboutReactThreeFiber"} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
