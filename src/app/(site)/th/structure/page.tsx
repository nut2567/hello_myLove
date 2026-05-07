import Link from "next/link";

const updatedAt = "7 พฤษภาคม 2026";

const currentStack = [
  {
    label: "Next.js",
    value: "16.2.4",
    detail:
      "ใช้ App Router, route group `(site)`, dynamic import และ build ด้วย Turbopack",
  },
  {
    label: "React",
    value: "19.2.4",
    detail:
      "หน้า route เป็น Server Component เป็นหลัก และแยกเกม interactive เป็น Client Component",
  },
  {
    label: "Three.js",
    value: "0.182.0",
    detail: "ใช้เป็น engine WebGL สำหรับฉาก 3D ใน RobotDragGameV2",
  },
  {
    label: "React Three Fiber",
    value: "9.6.1",
    detail:
      "เขียน Three.js เป็น React component ผ่าน `<Canvas>`, `<mesh>` และ `useFrame`",
  },
  {
    label: "Drei",
    value: "10.7.7",
    detail:
      "เพิ่ม helper เช่น `OrbitControls`, `Environment`, `Html` และ `ContactShadows`",
  },
  {
    label: "Tailwind CSS",
    value: "4",
    detail: "ใช้ utility class และ design token จาก `src/app/globals.css`",
  },
];

const routes = [
  {
    path: "/th",
    file: "src/app/(site)/th/page.tsx",
    detail: "หน้าแรกภาษาไทย มีหัวใจนำไปยัง sequence A-D",
  },
  {
    path: "/th/structure",
    file: "src/app/(site)/th/structure/page.tsx",
    detail: "หน้าที่กำลังอ่านอยู่ ใช้สรุปโครงสร้างล่าสุดของโปรเจกต์",
  },
  {
    path: "/th/RobotDragGame",
    file: "src/app/(site)/th/RobotDragGame/page.tsx",
    detail:
      "โหลดเกมด้วย `next/dynamic` และปิด SSR เพราะเกมใช้ WebGL/browser API",
  },
  {
    path: "/[[...slug]]",
    file: "src/app/(site)/[[...slug]]/page.tsx",
    detail: "catch-all route สำหรับ path อื่นที่ไม่ได้มี route เฉพาะ",
  },
];

const robotGameFiles = [
  {
    file: "src/components/RobotDragGame.tsx",
    role: "ตัวเลือกเวอร์ชัน",
    detail:
      "เป็น wrapper ที่ให้สลับ `v1` และ `v2` จากปุ่มมุมขวาล่าง โดย default เปิด `v2`",
  },
  {
    file: "src/components/RobotDragGameV1.tsx",
    role: "เวอร์ชันเดิม",
    detail:
      "เกม 2D แบบ pixel robot ใช้ DOM, pointer event, difficulty และเป้าหมายแบบกระพริบ",
  },
  {
    file: "src/components/RobotDragGameV2.tsx",
    role: "เวอร์ชันล่าสุด",
    detail:
      "เกม 3D ด้วย React Three Fiber มี arena, หุ่นยนต์ 3D, target beacon, drag บนฉาก WebGL และ OrbitControls",
  },
];

const v2Flow = [
  "RobotDragGameV2 เก็บ state หลักของเกม เช่น difficulty, ตำแหน่งหุ่น, target, rescued count และสถานะ mission complete",
  "Canvas สร้างฉาก WebGL พร้อมกล้อง แสง fog environment และ shadow",
  "RobotArena เป็น logic หลัก คุมการเดินอัตโนมัติ การลาก การตรวจระยะ target และการย้ายหุ่นไป dock เมื่อ rescue สำเร็จ",
  "RobotModel สร้างหุ่นยนต์จาก geometry พื้นฐาน เช่น box, sphere และ cylinder พร้อม animation ด้วย useFrame",
  "TargetBeacon แสดงเป้าหมายเป็นวงแหวน 3D มีแสงและการหมุนเพื่อให้เห็นจุดหมายชัดขึ้น",
  "OrbitControls เปิดให้หมุนมุมกล้อง แต่จะปิดชั่วคราวตอนลากหุ่นเพื่อไม่ให้ชนกับ drag interaction",
];

const workspaceTree = `src/
  app/
    (site)/
      th/
        page.tsx
        structure/page.tsx
        RobotDragGame/page.tsx
      [[...slug]]/page.tsx
    globals.css
    layout.tsx
  components/
    RobotDragGame.tsx
    RobotDragGameV1.tsx
    RobotDragGameV2.tsx
    ShipScene.tsx
    layout/site-shell.tsx
    ui/
    home/
  lib/
    site.ts
  proxy.ts`;

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-normal text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
        {title}
      </h2>
      {children ? (
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {children}
        </p>
      ) : null}
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.92em] text-foreground">
      {children}
    </code>
  );
}

export default function StructurePage() {
  return (
    <div className="bg-background text-foreground">
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
              ไว้เป็น <InlineCode>v1</InlineCode> และเพิ่มเวอร์ชันใหม่แบบ 3D
              เป็น <InlineCode>v2</InlineCode>.
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

      <section className="border-b border-border bg-muted">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[0.85fr_1fr] lg:items-start">
          <SectionHeading eyebrow="Routes" title="เส้นทางหน้าหลักที่มีในระบบ">
            route ภาษาไทยอยู่ใต้ <InlineCode>/th</InlineCode> และ route เกมใช้
            dynamic import เพื่อให้โหลดเฉพาะฝั่ง browser.
          </SectionHeading>

          <div className="grid gap-3">
            {routes.map((route) => (
              <article
                key={route.path}
                className="rounded-lg border border-border bg-surface p-5 shadow-soft"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="font-mono text-sm font-semibold text-accent">
                    {route.path}
                  </h3>
                  <p className="break-all font-mono text-xs text-muted-foreground">
                    {route.file}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {route.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="robot-v2" className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
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
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <SectionHeading eyebrow="Workspace" title="โครงสร้างไฟล์ที่ควรรู้">
            แผนผังนี้สะท้อนโครงสร้างล่าสุดหลังแยกเกมเป็น{" "}
            <InlineCode>RobotDragGameV1</InlineCode> และ{" "}
            <InlineCode>RobotDragGameV2</InlineCode>.
          </SectionHeading>

          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-5 text-sm leading-7 text-foreground shadow-soft">
            <code>{workspaceTree}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
