import { InlineCode } from "../structure-ui";

export function RobotV2ModelStructureSection() {
  return (
    <>
                    <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-normal text-foreground">
                          โครงสร้างภายใน RobotModel
                        </h3>
                        <p className="mt-4 text-base leading-7 text-muted-foreground">
                          <InlineCode>RobotModel</InlineCode> รับ{" "}
                          <InlineCode>config</InlineCode> สำหรับสีและชื่อ,{" "}
                          <InlineCode>state</InlineCode> สำหรับตำแหน่งและสถานะจับสำเร็จ,
                          <InlineCode>isDragging</InlineCode> สำหรับ state ตอนกำลังลาก
                          และ <InlineCode>onPointerDown</InlineCode> เพื่อเริ่ม drag.
                        </p>
                        <p className="mt-4 text-base leading-7 text-muted-foreground">
                          ภายใน JSX ใช้ <InlineCode>{"<group>"}</InlineCode>{" "}
                          เป็นตัวครอบหุ่นทั้งตัว แล้ววาง <InlineCode>{"<mesh>"}</InlineCode>{" "}
                          หลายชิ้นไว้ข้างใน แต่ละ mesh มี geometry และ material ของตัวเอง.
                          ถ้าจะเพิ่มชิ้นส่วนใหม่ให้เพิ่ม mesh ใหม่ใน group นี้ และกำหนด{" "}
                          <InlineCode>position</InlineCode>, <InlineCode>rotation</InlineCode>,
                          geometry และ material ให้เหมาะกับชิ้นส่วนนั้น.
                        </p>
                      </div>
          
                      <div className="rounded-lg border border-border bg-surface p-5 shadow-soft">
                        <h3 className="text-lg font-semibold text-foreground">
                          ชิ้นส่วนที่แก้บ่อย
                        </h3>
                        <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
                          <li>
                            <InlineCode>boxGeometry args={[0.5, 0.58, 0.38]}</InlineCode>{" "}
                            คือขนาดลำตัว
                          </li>
                          <li>
                            <InlineCode>boxGeometry args={[0.62, 0.42, 0.48]}</InlineCode>{" "}
                            คือขนาดหัว
                          </li>
                          <li>
                            <InlineCode>sphereGeometry args={[0.045, 16, 12]}</InlineCode>{" "}
                            คือขนาดตา
                          </li>
                          <li>
                            <InlineCode>cylinderGeometry args={[0.025, 0.025, 0.28, 12]}</InlineCode>{" "}
                            คือเสาอากาศ
                          </li>
                          <li>
                            <InlineCode>group.scale</InlineCode> และ{" "}
                            <InlineCode>group.position.y</InlineCode>{" "}
                            ใน <InlineCode>useFrame</InlineCode> คือ animation ตอนลากและตอน rescue
                          </li>
                        </ul>
                      </div>
                    </div>
    </>
  );
}
