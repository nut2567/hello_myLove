import { v2FunctionMap } from "../structure-data";
import { SectionHeading } from "../structure-ui";

export function RobotV2FunctionsSection() {
  return (
    <>
                    <div className="mt-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                      <SectionHeading
                        eyebrow="V2 Functions"
                        title="แผนที่ฟังก์ชันใน RobotDragGameV2.tsx"
                      >
                        ส่วนนี้อธิบายเฉพาะ v2 เพื่อให้รู้ว่าควรเข้าไปแก้ตรงไหนก่อน
                        โดยเฉพาะตอนแยกระหว่างงานวาดโมเดล งานคุมสนาม และงานคุม state เกม.
                      </SectionHeading>
          
                      <div className="grid gap-3">
                        {v2FunctionMap.map((item) => (
                          <article
                            key={item.name}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <h3 className="font-mono text-sm font-semibold text-accent">
                                {item.name}
                              </h3>
                              <p className="text-sm font-semibold text-foreground">
                                {item.role}
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
