import { currentStack } from "./structure-data";
import { SectionHeading } from "./structure-ui";

export function StackSection() {
  return (
    <section className="border-b border-border">
            <div className="mx-auto w-full max-w-6xl px-6 py-14">
              <SectionHeading eyebrow="Stack" title="เทคโนโลยีที่ใช้อยู่ตอนนี้">
                โปรเจกต์ยังเป็น Next.js App Router แต่ส่วนเกม 3D แยกเป็น Client
                Component เพราะต้องใช้ WebGL, animation frame และ pointer event.
              </SectionHeading>
    
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentStack.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.label}
                      </h3>
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                        {item.value}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {item.detail}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
  );
}
