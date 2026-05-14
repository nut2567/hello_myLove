import { v2TypeMap } from "../structure-data";
import { SectionHeading } from "../structure-ui";

export function RobotV2TypesSection() {
  return (
    <>
          
                    <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                      <SectionHeading
                        eyebrow="Types"
                        title="TypeScript type ที่อยู่ด้านบนไฟล์"
                      >
                        type เหล่านี้ไม่ได้ render UI เอง แต่เป็นสัญญาข้อมูลของเกม
                        ทำให้ config, state, motion และ drag session ใช้รูปแบบเดียวกันทั้งไฟล์.
                      </SectionHeading>
          
                      <div className="grid gap-3">
                        {v2TypeMap.map((item) => (
                          <article
                            key={item.name}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <h3 className="font-mono text-sm font-semibold text-accent">
                              {item.name}
                            </h3>
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
