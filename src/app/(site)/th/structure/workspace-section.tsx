
import { TranslatedText } from "@/components/translated-text";

import { workspaceTree } from "./structure-data";
import { InlineCode, SectionHeading } from "./structure-ui";

export function WorkspaceSection() {
  return (
    <section className="bg-background">
            <div className="container mx-auto grid gap-8 px-6 py-14 lg:grid-cols-[0.8fr_1fr] lg:items-start">
              <SectionHeading eyebrow="Structure.workspace" title="Structure.keyProjectFiles"><TranslatedText messageKey={"Structure.thisTreeShowsTheStructureAfterSplittingTheGameInto"} />{" "}
                <InlineCode>RobotDragGameV1</InlineCode><TranslatedText messageKey={"Structure.and"} before=" " />{" "}
                <InlineCode>RobotDragGameV2</InlineCode>.
              </SectionHeading>
    
              <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-5 text-sm leading-7 text-foreground shadow-soft">
                <code>{workspaceTree}</code>
              </pre>
            </div>
          </section>
  );
}
