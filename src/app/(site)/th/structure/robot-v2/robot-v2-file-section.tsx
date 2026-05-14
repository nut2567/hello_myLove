import { v2FileSections } from "../structure-data";
import { SectionHeading } from "../structure-ui";

export function RobotV2FileSection() {
  return (
    <>
          
                    <div className="mt-14">
                      <SectionHeading
                        eyebrow="V2 Full File"
                        title="RobotDragGameV2.tsx ทำอะไรบ้างทั้งไฟล์"
                      >
                        ไฟล์นี้เป็นเกม 3D เต็มหน้าจอที่ให้ผู้เล่นลากหุ่นยนต์ไปยัง
                        target beacon ในสนาม WebGL. โค้ดแบ่งเป็น 5 ชั้นหลักคือ imports
                        และ type, ค่าคงที่/config, helper function, component ย่อยของ
                        ฉาก 3D และ component หลักที่ถือ state ของเกม.
                      </SectionHeading>
          
                      <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {v2FileSections.map((item) => (
                          <article
                            key={item.name}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <h3 className="font-mono text-sm font-semibold text-accent">
                              {item.name}
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-foreground">
                              {item.role}
                            </p>
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
