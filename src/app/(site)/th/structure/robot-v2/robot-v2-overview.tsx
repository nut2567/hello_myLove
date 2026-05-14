import { robotGameFiles, v2Flow } from "../structure-data";
import { InlineCode, SectionHeading } from "../structure-ui";

export function RobotV2Overview() {
  return (
    <>
                    <SectionHeading
                      eyebrow="Robot Drag Game"
                      title="สถานะล่าสุดของเกม v1 และ v2"
                    >
                      ตอนนี้ไฟล์หลัก <InlineCode>RobotDragGame.tsx</InlineCode>{" "}
                      ไม่ได้เป็นตัวเกมโดยตรงแล้ว แต่เป็นตัวเลือกเวอร์ชัน ทำให้เก็บของเดิม
                      และของใหม่ไว้พร้อมกันได้.
                    </SectionHeading>
          
                    <div className="mt-8 grid gap-4 lg:grid-cols-3">
                    {robotGameFiles.map((item) => (
                        <article
                          key={item.file}
                          className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                        >
                          <p className="text-sm font-semibold text-accent">{item.role}</p>
                          <h3 className="mt-3 break-all font-mono text-sm font-semibold text-foreground">
                            {item.file}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {item.detail}
                          </p>
                        </article>
                      ))}
                    </div>
          
                    <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-normal text-foreground">
                          React Three Fiber คืออะไร
                        </h3>
                        <p className="mt-4 text-base leading-7 text-muted-foreground">
                          React Three Fiber คือ renderer ที่ทำให้เขียน Three.js ด้วย React
                          ได้ เช่นใช้ <InlineCode>{"<Canvas>"}</InlineCode> เป็นฉาก 3D,
                          ใช้ <InlineCode>{"<mesh>"}</InlineCode> เป็นวัตถุ และใช้{" "}
                          <InlineCode>useFrame</InlineCode> เพื่ออัปเดต animation ทุก
                          frame.
                        </p>
                        <p className="mt-4 text-base leading-7 text-muted-foreground">
                          ใน <InlineCode>RobotDragGameV2.tsx</InlineCode>{" "}
                          มันถูกใช้เพื่อเปลี่ยนเกมจาก DOM 2D เป็น WebGL 3D โดยยังคง
                          gameplay เดิมคือการลากหุ่นไปยังเป้าหมาย.
                        </p>
                      </div>
          
                      <ol className="grid gap-3">
                        {v2Flow.map((item, index) => (
                          <li
                            key={item}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <div className="flex gap-4">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
                                {index + 1}
                              </span>
                              <p className="text-sm leading-6 text-muted-foreground">
                                {item}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
    </>
  );
}
