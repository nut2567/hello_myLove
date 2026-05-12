# Hello MyLove

This app is structured for [Next.js 16](https://nextjs.org/docs) and
[Tailwind CSS 4](https://tailwindcss.com/docs).

## Stack

- Next.js 16 App Router with Turbopack defaults
- React 19
- Tailwind CSS 4 with `@tailwindcss/postcss`
- TypeScript, ESLint flat config, and the `src` application folder

## Project Structure

```txt
src/
  app/                 Route files, root layout, global Tailwind import
  components/home/     Home page sections
  components/layout/   Shared app shells and layout components
  components/ui/       Reusable UI primitives
  lib/                 Shared data and configuration
```

## Robot Drag Game V2 Notes

ส่วนนี้อธิบายเกม 3D เวอร์ชัน V2 ที่อยู่ใน `src/components/robot-drag-game/V2/`
เอาไว้อ่านตอนแก้โค้ดหรือปรับค่าต่าง ๆ ภายหลัง

### ไฟล์หลัก

- `RobotDragGameV2.tsx`
  - ไฟล์หลักของเกม V2
  - เก็บ state ของเกม เช่น difficulty, robot positions, dinosaur positions, target, captured count
  - มี logic การสุ่มตำแหน่ง, การเดินเองของโมเดล, การลากโมเดล, การชนขอบสนาม, การจับ robot เข้าเป้า และ UI ด้านบน
  - เป็นไฟล์ที่ควรเริ่มอ่านก่อนถ้าต้องแก้ gameplay

- `models.tsx`
  - วาดโมเดล 3D ของ `RobotModel`, `DinosaurModel`, และ `TargetBeacon`
  - ใช้ `useFrame` เพื่อ animate การขยับแบบ smooth ด้วย `MathUtils.lerp`
  - ถ้าจะเปลี่ยนหน้าตา robot, dinosaur, สี, geometry, animation เล็ก ๆ เช่น หัวส่าย หางส่าย ให้แก้ไฟล์นี้

- `ArenaFloor.tsx`
  - วาดพื้นสนาม, grid, กำแพงรอบสนาม และ dock สำหรับ robot ที่ถูกช่วยสำเร็จ
  - ถ้าจะเปลี่ยนขนาดพื้น สีพื้น เส้น grid กำแพง หรือจุดจอด robot ให้ดูไฟล์นี้ร่วมกับ `robotConfigs.ts`

- `robotConfigs.ts`
  - รวมค่าคงที่และ config หลักของเกม
  - เช่น ขนาดสนาม, radius ของ robot/dinosaur, scale ของโมเดล, จำนวน robot, สี robot, difficulty settings
  - เป็นไฟล์ที่เหมาะกับการปรับบาลานซ์เกมโดยไม่แตะ logic ใหญ่

- `types.ts`
  - รวม TypeScript types ของเกม
  - ถ้าเพิ่ม property ใหม่ใน state/config เช่น energy, score, status ต้องมาเพิ่ม type ที่นี่ก่อนหรือพร้อมกับ logic

### Flow การทำงานของ V2

1. `RobotDragGameV2` สร้าง state เริ่มต้น เช่น robot, dinosaur, target, difficulty
2. `<Canvas>` สร้างฉาก 3D, camera, fog, light, environment และ controls
3. `RobotArena` รับ state แล้ว render พื้น, target, dinosaurs, robots
4. `useFrame` ใน `RobotArena` ทำงานทุก frame เพื่ออัปเดต gameplay
5. เมื่อ state เปลี่ยน `RobotModel` และ `DinosaurModel` จะ lerp ไปยังตำแหน่งใหม่ให้ดูเคลื่อนที่ลื่นขึ้น
6. ถ้าลาก robot ไปเข้า target สำเร็จ เกมจะย้าย robot ไป dock และเพิ่ม captured count

### Functions สำคัญใน `RobotDragGameV2.tsx`

- `randomBetween(min, max)`
  - สุ่มตัวเลขระหว่าง min/max
  - ใช้กับตำแหน่ง, ความเร็ว, ระยะเวลาหยุด, ระยะเวลา target กระพริบ

- `clamp(value, min, max)`
  - จำกัดค่าไม่ให้น้อยกว่า min หรือมากกว่า max
  - ใช้กันโมเดลหลุดออกนอกสนาม

- `distance2D(a, b)`
  - วัดระยะบนระนาบ X/Z
  - ใช้เช็กว่า robot เข้าใกล้ target หรือ dinosaur เฝ้า target อยู่หรือไม่

- `getForwardYaw(deltaX, deltaZ)`
  - แปลงทิศทางการเคลื่อนที่เป็นมุมหมุน `yaw`
  - ตอนนี้ถือว่าด้านหน้าโมเดลอยู่ทางแกน `-Z`
  - ถ้าโมเดลหันเหมือนเดินถอยหลัง ให้ตรวจ function นี้หรือแกนด้านหน้าของโมเดลใน `models.tsx`

- `createPoint(margin)`
  - สุ่มตำแหน่ง target ใหม่ภายในสนาม
  - เพิ่ม margin ถ้าไม่อยากให้ target ไปชิดขอบ

- `clampArenaPoint(point, radius)`
  - จำกัดตำแหน่งให้อยู่ในสนามโดยเผื่อ radius ของโมเดล
  - radius ใหญ่ขึ้น โมเดลจะอยู่ห่างขอบมากขึ้น

- `createRobotStates()` / `createDinosaurStates()`
  - สร้างตำแหน่งเริ่มต้นของ robot/dinosaur
  - ถ้าจะเปลี่ยนจุดเกิดตอนเริ่มเกม ให้แก้สอง function นี้

- `createRobotMotion()` / `createDinosaurMotion()`
  - สร้างทิศทางและความเร็วแบบสุ่ม
  - `vx` คือความเร็วบนแกน X, `vz` คือความเร็วบนแกน Z
  - ปรับช่วง speed เพื่อให้เดินเร็ว/ช้าขึ้น
  - ปรับ `changeAt` เพื่อให้เปลี่ยนทิศบ่อย/น้อยลง
  - ปรับโอกาส pause เพื่อให้โมเดลหยุดนิ่งบ่อย/น้อยลง

- `moveWithinArena(point, motion, radius, delta)`
  - คำนวณตำแหน่งใหม่และเช็กว่าชนขอบสนามหรือไม่
  - ถ้าชนขอบ logic ใน `useFrame` จะกลับทิศ `vx` หรือ `vz`

- `createFlashSchedule()`
  - กำหนดรอบการกระพริบของ target ใน difficulty ที่ target ไม่ได้ visible ตลอด
  - ใช้ `flashDuration` และ `flashInterval` จาก `robotConfigs.ts`

- `countCaptured(states)`
  - นับจำนวน robot ที่ถูกช่วยแล้วและยังไม่ removed

- `finishDrag()`
  - ทำงานเมื่อปล่อยเมาส์/นิ้วหลังลาก
  - ถ้าลาก robot เข้า target สำเร็จ จะย้าย robot ไป dock
  - ถ้า target ถูก dinosaur เฝ้าอยู่ robot จะถูกย้ายออกนอกสนามและ `removed: true`

- `handleRobotPointerDown()` / `handleDinosaurPointerDown()`
  - เริ่ม drag session เมื่อกดที่โมเดล
  - เก็บ offset เพื่อให้ลากแล้วโมเดลไม่กระโดดไปอยู่ตรง pointer ทันที

### `useFrame` ใน `RobotArena` ทำอะไร

`useFrame((frameState, delta) => { ... })` คือ loop ที่ทำงานทุก frame ในฉาก 3D

- ถ้าเกมจบแล้ว จะหยุด update gameplay
- ถ้ามีการลากโมเดล จะ raycast จาก pointer ลงพื้น แล้วอัปเดตตำแหน่งโมเดลที่ถูกลาก
- คำนวณว่า target ควร visible หรือไม่
- อัปเดต dinosaur ที่ไม่ได้ถูกลากให้เดินเอง
- อัปเดต robot ที่ไม่ได้ถูกลาก/ถูกจับ/ถูกลบให้เดินเอง
- เมื่อโมเดลชนขอบสนาม จะกลับทิศทางเดิน
- อัปเดต `yaw` ให้โมเดลหันตามทิศที่กำลังเคลื่อนที่

### ค่าที่แก้บ่อยใน `robotConfigs.ts`

- `ARENA_WIDTH` / `ARENA_DEPTH`
  - ขนาดสนาม
  - เพิ่มค่าแล้วสนามกว้างขึ้น แต่ควรดู camera, fog, wall, grid ด้วยว่า framing ยังพอดีไหม

- `DINOSAUR_RADIUS` / `ROBOT_RADIUS`
  - radius ที่ใช้คำนวณการชนขอบและระยะปลอดภัย
  - ไม่ใช่ขนาด geometry โดยตรง แต่มีผลต่อการเดินชิดขอบและการ clamp ตำแหน่ง

- `DINOSAUR_MODEL_SCALE` / `ROBOT_MODEL_SCALE`
  - ขนาดที่ render โมเดลจริงในฉาก
  - ถ้า scale ใหญ่ขึ้นมาก ควรปรับ radius ให้สัมพันธ์กัน

- `ROBOT_COUNT`
  - จำนวน robot ที่ต้องช่วย
  - ถ้าเพิ่มจำนวน ต้องเพิ่มรายการใน `robotConfigs` และอาจปรับ dock spacing ใน `getDockPoint`

- `robotConfigs`
  - กำหนด id, ชื่อ, สีหลัก, สีรอง, สี emissive, และ phase animation ของ robot แต่ละตัว
  - `phase` ทำให้ animation แต่ละตัวไม่เด้งพร้อมกัน

- `difficulties`
  - `speed`: ความเร็วรวมของ robot/dinosaur ใน difficulty นั้น
  - `targetRadius`: ระยะที่ถือว่า robot เข้า target สำเร็จ
  - `alwaysVisible`: target มองเห็นตลอดหรือไม่
  - `flashDuration`: target visible นานแค่ไหนต่อรอบ
  - `flashInterval`: ระยะห่างระหว่างรอบกระพริบ
  - `nearRevealDistance`: ถ้า robot เข้าใกล้ target แค่ไหน target จะถูก reveal

- `getDockPoint(index)`
  - ตำแหน่งจอด robot ที่ช่วยสำเร็จแล้ว
  - `gap` คือระยะห่างระหว่าง dock แต่ละจุด
  - `z: HALF_DEPTH - 0.55` ทำให้ dock อยู่ใกล้ขอบด้านหลังสนาม

### ค่าฉาก 3D ใน `<Canvas>`

- `camera={{ fov: 45, position: [0, 5.8, 7.8] }}`
  - `fov` มากขึ้นเห็นกว้างขึ้นแต่ perspective แรงขึ้น
  - `position` คือจุดวางกล้อง `[x, y, z]`

- `<color attach="background" args={["#050816"]} />`
  - สีพื้นหลังฉาก

- `<fog attach="fog" args={["#050816", 8, 16]} />`
  - หมอกในฉาก
  - ค่า 8 คือเริ่มมีหมอก, 16 คือหมอกทึบมาก

- `<ambientLight intensity={0.55} />`
  - แสงรวมทั้งฉาก ไม่มีทิศทาง
  - เพิ่มแล้วโมเดลสว่างทั่วขึ้น เงาจางลง

- `<directionalLight ... />`
  - แสงหลักแบบแสงอาทิตย์
  - `position` เปลี่ยนทิศเงา
  - `intensity` เปลี่ยนความสว่าง
  - `shadow-mapSize-*` เพิ่มแล้วเงาคมขึ้นแต่ใช้ performance มากขึ้น

- `<spotLight ... />`
  - ไฟสปอร์ตไลต์สีฟ้า
  - `angle` คุมความกว้างของลำแสง
  - `penumbra` คุมความนุ่มของขอบแสง
  - `intensity` คุมความแรง

- `<Environment preset="city" />`
  - เพิ่ม environment lighting/reflection ให้โมเดลดูมีมิติมากขึ้น
  - เปลี่ยน preset แล้ว mood แสงสะท้อนจะเปลี่ยน

- `<OrbitControls ... />`
  - ให้ผู้เล่นหมุน/ซูมกล้องได้เมื่อไม่ได้ลากโมเดล
  - `maxDistance` / `minDistance` คุมระยะซูม
  - `maxPolarAngle` / `minPolarAngle` คุมมุมก้มเงย
  - `target={[0, 0, 0]}` คือจุดที่กล้องมอง/หมุนรอบ

### การแก้หน้าตาโมเดลใน `models.tsx`

- `RobotModel`
  - group หลักรับ `state.x`, `state.z`, `state.yaw`
  - body/head/eye/antenna/arm/leg วาดด้วย mesh หลายชิ้น
  - ตำแหน่งตา robot อยู่ฝั่ง `z = -0.25` จึงถือว่าหน้า robot อยู่ทาง `-Z`
  - ถ้าเปลี่ยนด้านหน้าของโมเดล ต้องตรวจ `getForwardYaw` ด้วย

- `DinosaurModel`
  - body/head/eye/tail/spikes/legs/arms วาดด้วย mesh หลายชิ้น
  - หัวและตาอยู่ฝั่ง `z` ติดลบ ส่วนหางอยู่ฝั่ง `z` บวก
  - จึงถือว่าหน้า dinosaur อยู่ทาง `-Z` เช่นกัน

- `TargetBeacon`
  - วาดวงแหวน target และ point light
  - หมุนและ pulse scale ด้วย `useFrame`

### จุดที่ควรระวัง

- Logic เกมใช้แกนพื้นเป็น `x` และ `z`; แกน `y` คือความสูง
- อย่าแก้ scale โมเดลอย่างเดียวถ้า gameplay ต้องชนขอบ/เข้าเป้าแม่น ควรปรับ radius ให้สัมพันธ์กัน
- ถ้าโมเดลดูเดินถอยหลัง ปัญหามักอยู่ที่ `getForwardYaw` หรือทิศด้านหน้าของ geometry ใน `models.tsx`
- ถ้าเพิ่ม robot id ใหม่ ต้องเพิ่ม type `RobotId`, เพิ่ม config ใน `robotConfigs`, และตรวจ `ROBOT_COUNT`
- ถ้า target ง่าย/ยากเกินไป ให้ปรับ `targetRadius`, `nearRevealDistance`, `flashDuration`, `flashInterval`
- ถ้า animation กระตุก ให้เช็กจำนวน geometry, shadow map size, dpr, และความหนักของ light/shadow

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Run all local checks:

```bash
npm run check
npm run build
```

## Tailwind

Tailwind is loaded from `src/app/globals.css`:

```css
@import "tailwindcss";
```

Semantic design tokens are defined in the same file with `@theme inline`, so
components can use classes like `bg-surface`, `text-muted-foreground`, and
`border-border` without a separate `tailwind.config` file.
