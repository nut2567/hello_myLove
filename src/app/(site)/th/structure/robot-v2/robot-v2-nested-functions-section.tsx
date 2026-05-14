import { v2NestedFunctionMap } from "../structure-data";
import { InlineCode } from "../structure-ui";

export function RobotV2NestedFunctionsSection() {
  return (
    <>
          
                    <div className="mt-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-normal text-foreground">
                          Function ที่ซ้อนอยู่ใน component
                        </h3>
                        <p className="mt-4 text-base leading-7 text-muted-foreground">
                          นอกจาก function ระดับบนไฟล์ ยังมี function ที่ประกาศอยู่ข้างใน{" "}
                          <InlineCode>RobotArena</InlineCode> และ{" "}
                          <InlineCode>RobotDragGameV2</InlineCode>. กลุ่มนี้ผูกกับ state
                          หรือ ref ของ component นั้นโดยตรง จึงไม่ได้แยกออกมาเป็น helper
                          ระดับบนไฟล์.
                        </p>
                      </div>
          
                      <div className="grid gap-3">
                        {v2NestedFunctionMap.map((item) => (
                          <article
                            key={item.name}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <h4 className="font-mono text-sm font-semibold text-accent">
                                {item.name}
                              </h4>
                              <p className="text-sm font-semibold text-foreground">
                                อยู่ใน {item.owner}
                              </p>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                              {item.detail}
                            </p>
                          </article>
                        ))}
                      </div>
                    </div>
    </>
  );
}
