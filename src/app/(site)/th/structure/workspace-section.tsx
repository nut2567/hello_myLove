import { workspaceTree } from "./structure-data";
import { InlineCode, SectionHeading } from "./structure-ui";

export function WorkspaceSection() {
  return (
    <section className="bg-background">
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[0.8fr_1fr] lg:items-start">
              <SectionHeading eyebrow="Workspace" title="โครงสร้างไฟล์ที่ควรรู้">
                แผนผังนี้สะท้อนโครงสร้างล่าสุดหลังแยกเกมเป็น{" "}
                <InlineCode>RobotDragGameV1</InlineCode> และ{" "}
                <InlineCode>RobotDragGameV2</InlineCode>.
              </SectionHeading>
    
              <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-5 text-sm leading-7 text-foreground shadow-soft">
                <code>{workspaceTree}</code>
              </pre>
            </div>
          </section>
  );
}
