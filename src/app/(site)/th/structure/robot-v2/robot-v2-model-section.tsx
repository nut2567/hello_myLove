import { v2ModelEditNotes } from "../structure-data";
import { InlineCode, SectionHeading } from "../structure-ui";

export function RobotV2ModelSection() {
  return (
    <>
          
                    <div className="mt-14">
                      <SectionHeading
                        eyebrow="V2 Model"
                        title="ถ้าจะแก้ตัวโมเดล ต้องแก้ฟังก์ชันไหน"
                      >
                        จุดหลักคือ <InlineCode>function RobotModel</InlineCode> ในไฟล์{" "}
                        <InlineCode>src/components/robot-drag-game/V2/RobotDragGameV2.tsx</InlineCode>{" "}
                        เพราะฟังก์ชันนี้เป็นคนวาดชิ้นส่วนหุ่นยนต์ 3D ทั้งหมด ส่วน{" "}
                        <InlineCode>RobotArena</InlineCode> มีหน้าที่คุมเกมและส่ง state
                        เข้ามาให้โมเดลแสดงผล.
                      </SectionHeading>
          
                      <div className="mt-8 grid gap-4 lg:grid-cols-2">
                        {v2ModelEditNotes.map((item) => (
                          <article
                            key={item.title}
                            className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                          >
                            <p className="text-sm font-semibold text-accent">
                              {item.title}
                            </p>
                            <h3 className="mt-3 font-mono text-sm font-semibold text-foreground">
                              {item.target}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                              {item.detail}
                            </p>
                          </article>
                        ))}
                      </div>
          
                      <div className="mt-8 rounded-lg border border-cyan-200/30 bg-cyan-300/10 p-5">
                        <h3 className="text-lg font-semibold text-foreground">
                          สรุปสั้นที่สุด
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          ถ้าต้องการเปลี่ยนหน้าตาหุ่น เช่น ทำหัวกลมขึ้น เพิ่มแขน
                          เปลี่ยนขนาดตัว ย้ายตำแหน่งตา หรือเพิ่มชิ้นส่วนใหม่ ให้แก้ใน{" "}
                          <InlineCode>RobotModel</InlineCode>. ถ้าต้องการเปลี่ยนพฤติกรรม
                          เช่น หุ่นเดินเร็วขึ้น ลากติดมือขึ้น หรือ rescue ง่ายขึ้น ให้แก้ใน{" "}
                          <InlineCode>RobotArena</InlineCode> และค่าคงที่ด้านบนไฟล์.
                        </p>
                      </div>
                    </div>
          
    </>
  );
}
