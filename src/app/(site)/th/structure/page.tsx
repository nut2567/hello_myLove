import Link from "next/link";

const updatedAt = "10 พฤษภาคม 2026";

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
    file: "src/components/robot-drag-game/RobotDragGame.tsx",
    role: "ตัวเลือกเวอร์ชัน",
    detail:
      "เป็น wrapper ที่ให้สลับ `v1` และ `v2` จากปุ่มมุมขวาล่าง โดย default เปิด `v2`",
  },
  {
    file: "src/components/robot-drag-game/V1/RobotDragGameV1.tsx",
    role: "เวอร์ชันเดิม",
    detail:
      "เกม 2D แบบ pixel robot ใช้ DOM, pointer event, difficulty และเป้าหมายแบบกระพริบ",
  },
  {
    file: "src/components/robot-drag-game/V2/RobotDragGameV2.tsx",
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

const v2ModelEditNotes = [
  {
    title: "แก้รูปทรงหุ่น",
    target: "function RobotModel",
    detail:
      "แก้ JSX ภายใน `RobotModel` โดยตรง ส่วนที่เป็น `<mesh>`, `<boxGeometry>`, `<sphereGeometry>` และ `<cylinderGeometry>` คือชิ้นส่วนของหุ่น เช่น ลำตัว หัว ตา เสาอากาศ แขน และเท้า",
  },
  {
    title: "แก้สีของหุ่นแต่ละตัว",
    target: "robotConfigs",
    detail:
      "แก้ค่า `primary`, `secondary` และ `emissive` ใน `robotConfigs` ถ้าต้องการเปลี่ยนสีรายตัวโดยไม่แตะ geometry ของโมเดล",
  },
  {
    title: "แก้ animation ของโมเดล",
    target: "useFrame ใน RobotModel",
    detail:
      "แก้ค่าการลอยขึ้นลง, การ scale ตอนลาก, การหมุนหัว และการ lerp ตำแหน่ง ถ้าต้องการเปลี่ยนอารมณ์การเคลื่อนไหวของหุ่น",
  },
  {
    title: "แก้ตำแหน่ง/การเดินของหุ่นในสนาม",
    target: "RobotArena",
    detail:
      "แก้ `RobotArena` เมื่อสิ่งที่ต้องเปลี่ยนคือ logic เช่น การลาก, ความเร็วเดิน, การชนขอบสนาม, การ rescue หรือการวางหุ่นลง dock ไม่ใช่รูปทรงโมเดล",
  },
];

const v2FunctionMap = [
  {
    name: "RobotDragGameV2",
    role: "component หลักของหน้าเกม",
    detail:
      "เก็บ state ระดับเกมทั้งหมด แล้วประกอบ `<Canvas>`, แสง, กล้อง, `RobotArena`, `ContactShadows`, `OrbitControls` และ UI ด้านบน เช่น difficulty, rescued count, restart และ modal ตอนจบเกม",
  },
  {
    name: "RobotArena",
    role: "ตัวคุม gameplay ในฉาก 3D",
    detail:
      "ใช้ `useThree` และ `useFrame` เพื่อจัดการ pointer raycast, drag plane, การเดินอัตโนมัติของหุ่น, การเปิด/ปิด target beacon, การตรวจระยะเป้าหมาย และการย้ายหุ่นที่ rescue แล้วไป dock",
  },
  {
    name: "RobotModel",
    role: "ตัวโมเดลหุ่นยนต์ 3D",
    detail:
      "เป็นจุดหลักสำหรับแก้หน้าตาหุ่น ภายในประกอบด้วย mesh หลายชิ้น เช่น body, head, eyes, antenna, arms และ feet พร้อม animation เฉพาะตัวด้วย `useFrame`",
  },
  {
    name: "ArenaFloor",
    role: "พื้นสนามและ dock",
    detail:
      "สร้างพื้น grid, ขอบสนาม และวง dock ด้านบนของสนาม สีของ dock จะเปลี่ยนตามจำนวนหุ่นที่ถูก rescue แล้ว",
  },
  {
    name: "TargetBeacon",
    role: "เป้าหมายที่ต้องลากหุ่นไปหา",
    detail:
      "สร้างวงแหวนและแสงเป้าหมายแบบ 3D พร้อมหมุน/ขยายเล็กน้อยทุก frame เพื่อให้ผู้เล่นเห็นตำแหน่งเป้าหมายชัดขึ้น",
  },
];

const v2FileSections = [
  {
    name: '"use client"',
    role: "บอก Next.js ว่าไฟล์นี้เป็น Client Component",
    detail:
      "จำเป็นเพราะไฟล์นี้ใช้ `useState`, `useEffect`, pointer event, WebGL canvas และ browser API ผ่าน React Three Fiber",
  },
  {
    name: "imports จาก @react-three/fiber",
    role: "แกนหลักของฉาก 3D",
    detail:
      "`Canvas` สร้างพื้นที่ WebGL, `useFrame` ทำงานทุก animation frame, `useThree` ดึง camera/pointer/raycaster และ `ThreeEvent` ใช้ type event ของวัตถุ 3D",
  },
  {
    name: "imports จาก @react-three/drei",
    role: "helper ของ Three.js",
    detail:
      "`Environment` ใส่แสงสภาพแวดล้อม, `OrbitControls` หมุนกล้อง, `Html` วาง DOM label ในโลก 3D และ `ContactShadows` ทำเงาสัมผัสพื้น",
  },
  {
    name: "imports จาก three",
    role: "class พื้นฐานของ Three.js",
    detail:
      "`Color` ใช้ตั้งสีพื้นหลัง, `MathUtils` ใช้ lerp animation, `Plane` ใช้เป็นระนาบลาก, `Vector3` เก็บตำแหน่ง pointer ในโลก 3D และ type `Group`/`Mesh` ใช้กับ refs",
  },
];

const v2TypeMap = [
  {
    name: "RobotId",
    detail:
      "union type ของ id หุ่นทั้ง 5 ตัว ทำให้ state และ config อ้างชื่อหุ่นได้แบบ type-safe",
  },
  {
    name: "Difficulty",
    detail:
      "union type ของระดับความยาก `easy`, `medium`, `hard` ใช้เป็น key ของ object `difficulties`",
  },
  {
    name: "RobotConfig",
    detail:
      "ข้อมูลประจำตัวหุ่น เช่น id, ชื่อ, สีหลัก, สีรอง, สี emissive และ phase สำหรับทำ animation ให้แต่ละตัวขยับไม่พร้อมกัน",
  },
  {
    name: "RobotState",
    detail:
      "state ของหุ่นหนึ่งตัว มีตำแหน่ง `x`, `z`, มุมหัน `yaw` และสถานะ `captured`",
  },
  {
    name: "RobotStates",
    detail:
      "record ที่ map จาก `RobotId` ไปเป็น `RobotState` ใช้เก็บสถานะหุ่นทุกตัวในเกม",
  },
  {
    name: "RobotMotion / RobotMotions",
    detail:
      "ข้อมูลการเดินอัตโนมัติของหุ่น เช่น velocity แกน x/z, เวลาเปลี่ยนทิศ และเวลาหยุดพัก",
  },
  {
    name: "TargetPoint",
    detail:
      "ตำแหน่งบนพื้นสนาม ใช้แกน `x` และ `z` เพราะเกมวางวัตถุบนระนาบแนวนอน",
  },
  {
    name: "DragSession",
    detail:
      "ข้อมูลตอนกำลังลาก เก็บ id หุ่นและ offset ระหว่าง pointer กับตำแหน่งหุ่น เพื่อให้ลากแล้วไม่กระโดดไปติดกลาง pointer ทันที",
  },
  {
    name: "DifficultySettings",
    detail:
      "ค่าปรับ gameplay ต่อระดับความยาก เช่น ความเร็ว รัศมี target การมองเห็น target ช่วงเวลากระพริบ และระยะใกล้ที่ทำให้ target โผล่",
  },
];

const v2ConstantMap = [
  {
    name: "ARENA_WIDTH / ARENA_DEPTH",
    detail:
      "ขนาดสนามบนแกน x และ z ใช้ทั้งตอนวาดพื้น ขอบสนาม และจำกัดตำแหน่งหุ่น",
  },
  {
    name: "HALF_WIDTH / HALF_DEPTH",
    detail:
      "ครึ่งหนึ่งของขนาดสนาม ช่วยให้คำนวณขอบซ้ายขวาหน้าหลังง่ายขึ้น",
  },
  {
    name: "ROBOT_RADIUS",
    detail:
      "ระยะเผื่อรอบตัวหุ่น ใช้ clamp ตำแหน่งไม่ให้หุ่นทะลุออกนอกขอบสนาม",
  },
  {
    name: "ROBOT_COUNT",
    detail:
      "จำนวนหุ่นทั้งหมด ใช้คำนวณ dock และตรวจว่า rescue ครบหรือยัง",
  },
  {
    name: "robotConfigs",
    detail:
      "รายการหุ่นทั้ง 5 ตัว เป็นแหล่งแก้ชื่อ สี และ phase animation ของหุ่นแต่ละตัว",
  },
  {
    name: "difficulties",
    detail:
      "ชุด config ของระดับความยาก มีผลกับความเร็วหุ่น รัศมี target และ pattern การปรากฏของ target",
  },
  {
    name: "difficultyOrder",
    detail:
      "ลำดับปุ่ม difficulty ที่ render ใน UI ด้านบนของเกม",
  },
];

const v2HelperMap = [
  {
    name: "randomBetween(min, max)",
    detail:
      "สุ่มเลขทศนิยมระหว่าง min กับ max ใช้กับตำแหน่ง ความเร็ว เวลาเปลี่ยนทิศ และช่วงกระพริบของ target",
  },
  {
    name: "clamp(value, min, max)",
    detail:
      "บังคับค่าให้อยู่ในช่วงที่กำหนด ใช้กันหุ่นออกนอกสนามตอนเดินเองและตอนถูกลาก",
  },
  {
    name: "distance2D(a, b)",
    detail:
      "วัดระยะบนพื้นสนามด้วยแกน x/z ใช้ตรวจว่าหุ่นเข้าใกล้ target พอจะ rescue หรือ reveal target หรือยัง",
  },
  {
    name: "getNow()",
    detail:
      "คืนค่า `performance.now()` ถ้ามี browser performance API และคืน 0 ถ้าไม่มี ช่วยให้โค้ดไม่พังในสภาพแวดล้อมที่ยังไม่มี `performance`",
  },
  {
    name: "createPoint(margin = 0.9)",
    detail:
      "สุ่มตำแหน่ง target ใหม่ในสนาม โดยเว้น margin จากขอบสนามเพื่อไม่ให้เป้าหมายชิดขอบเกินไป",
  },
  {
    name: "createRobotStates()",
    detail:
      "สุ่มตำแหน่งเริ่มต้นและ yaw ของหุ่นทุกตัว ตอนเริ่มเกมหรือ restart",
  },
  {
    name: "createRobotMotion(now, difficulty)",
    detail:
      "สร้าง motion ของหุ่นหนึ่งตัว มีโอกาสหยุดพัก 18% ถ้าไม่หยุดจะสุ่มทิศ สุ่มความเร็ว แล้วคูณด้วย speed ของ difficulty",
  },
  {
    name: "createRobotMotions(now, difficulty)",
    detail:
      "สร้าง motion ครบทุกหุ่นโดยวน `robotConfigs` แล้วเรียก `createRobotMotion` ทีละตัว",
  },
  {
    name: "createFlashSchedule(now, difficulty)",
    detail:
      "คำนวณเวลาที่ target beacon จะปรากฏ/หายตาม difficulty ถ้า easy จะตั้ง `visibleUntil` เป็น infinity เพราะมองเห็นตลอด",
  },
  {
    name: "getDockPoint(index)",
    detail:
      "คำนวณตำแหน่ง dock ด้านบนของสนามสำหรับวางหุ่นที่ rescue สำเร็จ",
  },
  {
    name: "countCaptured(states)",
    detail:
      "นับจำนวนหุ่นที่มี `captured: true` ใช้แสดง rescued count และเลือก dock ถัดไป",
  },
];

const v2NestedFunctionMap = [
  {
    name: "finishDrag()",
    owner: "RobotArena",
    detail:
      "ทำงานตอน pointerup หรือ pointercancel ถ้ามี drag session จะหยุดลาก ตรวจระยะหุ่นกับ target ถ้าอยู่ในรัศมีจะตั้ง `captured: true`, ย้ายหุ่นไป dock, เพิ่ม count, สุ่ม target ใหม่ หรือจบเกมถ้าครบทุกตัว",
  },
  {
    name: "handleRobotPointerDown(id, event)",
    owner: "RobotArena",
    detail:
      "เริ่มลากหุ่นเมื่อกดบนโมเดล 3D โดยหยุด event bubbling, บันทึก id หุ่น และคำนวณ offset ระหว่างตำแหน่งหุ่นกับจุดที่ pointer ชน mesh",
  },
  {
    name: "restartGame(nextDifficulty = difficulty)",
    owner: "RobotDragGameV2",
    detail:
      "reset เกมใหม่ ตั้ง difficulty, สร้างตำแหน่งหุ่นใหม่, สุ่ม target ใหม่, reset dragged/captured/complete และเพิ่ม `restartKey` เพื่อบอก `RobotArena` ให้ reset motion กับ flash schedule",
  },
];

const v2StateMap = [
  {
    name: "difficulty",
    detail:
      "ระดับความยากปัจจุบัน ใช้เลือก speed, target radius และการมองเห็น target",
  },
  {
    name: "robotStates",
    detail:
      "ตำแหน่ง มุมหัน และสถานะ captured ของหุ่นทุกตัว เป็น state หลักที่ drive การ render ของ `RobotModel`",
  },
  {
    name: "target",
    detail:
      "ตำแหน่งเป้าหมายปัจจุบันที่ผู้เล่นต้องลากหุ่นไปหา",
  },
  {
    name: "targetVisible",
    detail:
      "ควบคุมว่า `TargetBeacon` มองเห็นหรือไม่ โดย easy เห็นตลอด ส่วน medium/hard จะกระพริบหรือโผล่เมื่อหุ่นอยู่ใกล้",
  },
  {
    name: "draggedId",
    detail:
      "id ของหุ่นที่กำลังถูกลาก ถ้าไม่ลากจะเป็น null และใช้ปิด `OrbitControls` ชั่วคราวระหว่างลาก",
  },
  {
    name: "capturedCount",
    detail:
      "จำนวนหุ่นที่ rescue แล้ว ใช้แสดง UI `Rescued x/5`",
  },
  {
    name: "isComplete",
    detail:
      "สถานะจบเกม ใช้หยุด logic ใน `RobotArena` และเปิด modal Mission Complete",
  },
  {
    name: "restartKey",
    detail:
      "ตัวเลขที่เพิ่มทุกครั้งตอน restart เพื่อ trigger effect ใน `RobotArena` แม้ difficulty จะไม่ได้เปลี่ยน",
  },
];

const v2RefMap = [
  {
    name: "statesRef / targetRef / difficultyRef",
    detail:
      "เก็บค่า state ล่าสุดไว้ใช้ใน `useFrame` และ event callback เพื่อเลี่ยงปัญหา closure เก่าระหว่าง animation loop",
  },
  {
    name: "targetVisibleRef / isCompleteRef / draggedIdRef",
    detail:
      "mirror state ที่ต้องถูกอ่านใน frame loop หรือ callback โดยไม่ต้องรอ render รอบใหม่",
  },
  {
    name: "dragRef",
    detail:
      "เก็บ drag session ปัจจุบัน ถ้ามีค่าคือกำลังลากหุ่นอยู่",
  },
  {
    name: "pointerWorldRef",
    detail:
      "Vector3 ที่ reuse เพื่อเก็บตำแหน่ง pointer หลัง raycast ชน plane ลดการสร้าง object ใหม่ทุก frame",
  },
  {
    name: "dragPlane",
    detail:
      "Plane แนวนอน y=0 ใช้แปลงตำแหน่ง pointer บนจอให้เป็นตำแหน่งบนพื้นสนาม",
  },
  {
    name: "motionsRef",
    detail:
      "เก็บ motion ของหุ่นทุกตัวสำหรับการเดินเอง และอัปเดตทุก frame โดยไม่ต้องเป็น React state",
  },
  {
    name: "flashRef",
    detail:
      "เก็บ schedule การกระพริบของ target beacon เช่น `nextAt` และ `visibleUntil`",
  },
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
    PixelRobot.tsx
    robot-drag-game/
      RobotDragGame.tsx
      V1/RobotDragGameV1.tsx
      V1/PixelRobot.tsx
      V2/RobotDragGameV2.tsx
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

          <div className="mt-14">
            <h3 className="text-2xl font-semibold tracking-normal text-foreground">
              Constants และ config หลัก
            </h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {v2ConstantMap.map((item) => (
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

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionHeading
              eyebrow="V2 Functions"
              title="แผนที่ฟังก์ชันใน RobotDragGameV2.tsx"
            >
              ส่วนนี้อธิบายเฉพาะ v2 เพื่อให้รู้ว่าควรเข้าไปแก้ตรงไหนก่อน
              โดยเฉพาะตอนแยกระหว่างงานวาดโมเดล งานคุมสนาม และงานคุม state เกม.
            </SectionHeading>

            <div className="grid gap-3">
              {v2FunctionMap.map((item) => (
                <article
                  key={item.name}
                  className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="font-mono text-sm font-semibold text-accent">
                      {item.name}
                    </h3>
                    <p className="text-sm font-semibold text-foreground">
                      {item.role}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>

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

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h3 className="text-2xl font-semibold tracking-normal text-foreground">
                Function ที่ซ้อนอยู่ใน component
              </h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                นอกจาก function ระดับบนไฟล์ ยังมี function ที่ประกาศอยู่ข้างใน{" "}
                <InlineCode>RobotArena</InlineCode> และ{" "}
                <InlineCode>RobotDragGameV2</InlineCode>. กลุ่มนี้ผูกกับ state
                หรือ ref ของ component นั้นโดยตรง จึงไม่ได้แยกออกมาเป็น helper
                ระดับบนไฟล์.
              </p>
            </div>

            <div className="grid gap-3">
              {v2NestedFunctionMap.map((item) => (
                <article
                  key={item.name}
                  className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h4 className="font-mono text-sm font-semibold text-accent">
                      {item.name}
                    </h4>
                    <p className="text-sm font-semibold text-foreground">
                      อยู่ใน {item.owner}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>

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
