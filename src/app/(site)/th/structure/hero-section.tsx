import Link from "next/link";
import { InlineCode } from "./structure-ui";
import { updatedAt } from "./structure-data";

export function HeroSection() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 lg:py-18">
        <div className="max-w-4xl">
          <p className="inline-flex rounded-md border border-accent/25 bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
            อัปเดตล่าสุด: {updatedAt}
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
            โครงสร้างล่าสุดของ Hello MyLove
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            หน้านี้สรุปสถานะปัจจุบันของโปรเจกต์ โดยเฉพาะเกม{" "}
            <InlineCode>RobotDragGame</InlineCode> ที่ตอนนี้เก็บเวอร์ชันเดิม
            ไว้เป็น <InlineCode>v1</InlineCode> และเพิ่มเวอร์ชันใหม่แบบ 3D เป็น{" "}
            <InlineCode>v2</InlineCode>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
              href="/th/RobotDragGame"
            >
              เปิด Robot Drag Game
            </Link>
            <a
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-muted"
              href="#robot-v2"
            >
              อ่าน React Three Fiber
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
