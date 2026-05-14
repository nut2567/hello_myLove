import { v2RefMap, v2StateMap } from "../structure-data";
import { InlineCode } from "../structure-ui";

export function RobotV2StateRefSection() {
  return (
    <>
          
                    <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1fr]">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-normal text-foreground">
                          State ใน RobotDragGameV2
                        </h3>
                        <div className="mt-6 grid gap-3">
                          {v2StateMap.map((item) => (
                            <article
                              key={item.name}
                              className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                            >
                              <h4 className="font-mono text-sm font-semibold text-accent">
                                {item.name}
                              </h4>
                              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {item.detail}
                              </p>
                            </article>
                          ))}
                        </div>
                      </div>
          
                      <div>
                        <h3 className="text-2xl font-semibold tracking-normal text-foreground">
                          Ref ใน RobotArena
                        </h3>
                        <p className="mt-4 text-base leading-7 text-muted-foreground">
                          <InlineCode>RobotArena</InlineCode> ใช้ ref เยอะเพราะ logic
                          หลักทำงานใน <InlineCode>useFrame</InlineCode> ทุก frame.
                          การอ่านค่าจาก ref ทำให้ animation loop ได้ค่าล่าสุดโดยไม่ต้อง
                          สร้าง callback ใหม่ทุกครั้งที่ React render.
                        </p>
                        <div className="mt-6 grid gap-3">
                          {v2RefMap.map((item) => (
                            <article
                              key={item.name}
                              className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                            >
                              <h4 className="font-mono text-sm font-semibold text-accent">
                                {item.name}
                              </h4>
                              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {item.detail}
                              </p>
                            </article>
                          ))}
                        </div>
                      </div>
                    </div>
    </>
  );
}
