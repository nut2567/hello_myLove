export const updatedAt = "10 พฤษภาคม 2026";

export const currentStack = [
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

export const routes = [
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

export const robotGameFiles = [
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

export const v2Flow = [
  "RobotDragGameV2 เก็บ state หลักของเกม เช่น difficulty, ตำแหน่งหุ่น, target, rescued count และสถานะ mission complete",
  "Canvas สร้างฉาก WebGL พร้อมกล้อง แสง fog environment และ shadow",
  "RobotArena เป็น logic หลัก คุมการเดินอัตโนมัติ การลาก การตรวจระยะ target และการย้ายหุ่นไป dock เมื่อ rescue สำเร็จ",
  "RobotModel สร้างหุ่นยนต์จาก geometry พื้นฐาน เช่น box, sphere และ cylinder พร้อม animation ด้วย useFrame",
  "TargetBeacon แสดงเป้าหมายเป็นวงแหวน 3D มีแสงและการหมุนเพื่อให้เห็นจุดหมายชัดขึ้น",
  "OrbitControls เปิดให้หมุนมุมกล้อง แต่จะปิดชั่วคราวตอนลากหุ่นเพื่อไม่ให้ชนกับ drag interaction",
];

export const v2ModelEditNotes = [
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

export const v2FunctionMap = [
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

export const v2FileSections = [
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

export const v2TypeMap = [
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

export const v2ConstantMap = [
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

export const v2HelperMap = [
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

export const v2NestedFunctionMap = [
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

export const v2StateMap = [
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

export const v2RefMap = [
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

export const workspaceTree = `src/
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
