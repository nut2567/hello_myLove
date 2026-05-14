import { v2HelperMap } from "../structure-data";

export function RobotV2HelpersSection() {
  return (
    <>
          
                    <div className="mt-14">
                      <h3 className="text-2xl font-semibold tracking-normal text-foreground">
                        Helper function ทั้งหมดใน v2
                      </h3>
                      <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                        กลุ่มนี้คือ function ที่ไม่ได้ render UI โดยตรง แต่ช่วยคำนวณค่า
                        ให้เกม เช่น สุ่มตำแหน่ง จำกัดตำแหน่ง วัดระยะ สร้าง motion
                        และนับจำนวนหุ่นที่ถูก rescue.
                      </p>
                      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {v2HelperMap.map((item) => (
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
    </>
  );
}
