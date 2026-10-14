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

## Local CD บน Windows: commit แล้ว deploy บนเครื่อง

ติดตั้งครั้งเดียวจากรากโปรเจกต์:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/install-local-cd.ps1
```

ต้องเปิด Docker Desktop และตั้งค่า DB/Auth ใน `.env.local` บนเครื่อง
commit แรกต้องรวมไฟล์ระบบ CD (`.githooks`, `.gitattributes`, `.dockerignore`, `scripts/*local*.ps1`,
Dockerfile, Compose, `next.config.ts`, `public/.gitkeep` และ `/api/health`) ด้วย
หลังจากนั้น `git commit` จะเริ่ม build/deploy เบื้องหลังโดยไม่ต้อง push และไม่ต้องใช้ `npm run dev`
ไม่มีการสร้าง commit หรือ push อัตโนมัติ

- Hook ใช้ `git archive` ของ commit นั้น จึงไม่รวมไฟล์ที่ยังไม่ได้ commit
- Build ตรวจ Next.js production build, ESLint และ TypeScript ก่อนใช้งาน
- ทดลอง container บนพอร์ต localhost ชั่วคราว และตรวจทั้งแอปกับการเชื่อมต่อ MongoDB ผ่าน `/api/health`
- เมื่อพร้อมจึงสลับ container `hello-next` ที่ `http://localhost:3600` โดยมีช่วงหยุดสั้น ๆ ตอนเปลี่ยนพอร์ต
  ถ้าเริ่ม container ใหม่ไม่สำเร็จ จะกลับไปใช้ container เดิม
- มี lock ป้องกัน deploy ซ้อนกัน และข้าม commit เก่าเมื่อมี commit ใหม่กว่าอยู่ใน checkout
- `.env.local` ใช้เฉพาะ runtime ไม่เข้า Git snapshot หรือ Docker image
- Container รันแบบ production ด้วย `restart: unless-stopped`; จะกลับมารันเมื่อ Docker engine เริ่มทำงาน
- Installer จะไม่เขียนทับ hooksPath หรือ hook เดิมที่ตั้งไว้

ตรวจสถานะและ log (เก็บใน `.git/local-cd` สำหรับ checkout หลัก):

```powershell
Get-Content .git/local-cd/status.json
$commit = git rev-parse HEAD
Get-Content ".git/local-cd/logs/$commit.log" -Tail 40
Get-Content ".git/local-cd/logs/$commit.error.log" -Tail 40
```

สั่ง deploy commit ปัจจุบันซ้ำได้ด้วย
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-local.ps1`
ถ้าต้องการเริ่มจากไฟล์ปัจจุบันก่อน commit ให้เพิ่ม `-WorkingTree` ซึ่งสถานะจะระบุว่าเป็น working tree
หยุด/เริ่มเว็บด้วย `docker stop hello-next` และ `docker start hello-next`
หากต้องข้าม deploy ชั่วคราว ให้ตั้ง `$env:HELLO_MYLOVE_SKIP_DEPLOY = '1'` ก่อน commit
แล้วลบตัวแปรด้วย `Remove-Item Env:HELLO_MYLOVE_SKIP_DEPLOY`
ปิด hook ถาวรใน checkout นี้ด้วย `git config --local --unset core.hooksPath`

ทดสอบ archive, rollback, การป้องกัน container อื่น และ hook จาก commit จริงใน repo ชั่วคราวด้วย
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File tests/local-cd.test.ps1`
การทดสอบนี้ใช้ Docker/HTTP จำลอง ไม่แก้ประวัติ Git หรือ container จริงของโปรเจกต์

## ภาษาและการตั้งค่าการอ่าน

เลือก TH / EN และเปิด “ตั้งค่าการอ่าน” จากแถบหลักหรือแถบควบคุมในเกมหุ่นยนต์
ขนาดตัวอักษรมีเล็ก ปกติ ใหญ่ และใหญ่มาก (87.5%, 100%, 112.5%, 125%)
ธีมมีปกติ คอนทราสต์พื้นดำ และคอนทราสต์พื้นขาว โดยจำค่าบนเบราว์เซอร์และใช้ร่วมกันทุกหน้า
การคืนค่าการอ่านจะคืนเฉพาะขนาดตัวอักษรและธีม โดยคงภาษาที่เลือกไว้

- `src/components/ui-preferences-provider.tsx` ครอบแอปและให้ `useUiPreferences()` สำหรับหน้าอื่น
- `src/lib/ui-preferences.ts` กำหนดชนิดและตรวจค่าที่เก็บใน localStorage
- `messages/th.json` และ `messages/en.json` เก็บคำแปลแยก namespace เช่น `Navigation`, `Admin`, `HeartGame`, `Structure`
- `src/i18n/messages.ts` โหลดข้อความให้ `NextIntlClientProvider` ตามภาษาที่จำไว้
- ใช้ `import { useTranslations } from "next-intl"` ใน Client Components แล้วเรียก
  `const t = useTranslations("Admin");` และ `t("title")` เหมือนโปรเจกต์ pdmo
- ใช้ `<TranslatedText messageKey="Common.continue" />` สำหรับข้อความใน Server Components
  เพื่อให้เปลี่ยนภาษาทันทีโดยไม่ต้องย้ายหน้าไปเป็น Client Component
- แปลเฉพาะข้อความ UI ที่ระบุไว้ในโค้ด: แสดงชื่อผู้ใช้ ประเภทผู้ใช้ ลิงก์ และข้อความตอบกลับจาก API โดยตรง
  อย่าส่งค่าจาก API เข้า `TranslatedText` หรือฟังก์ชันแปล
- URL และข้อมูล API ใช้รูปแบบเดิม รวมถึงเส้นทาง `/th/...` และหน้าเฉพาะของผู้ใช้
- หน้าที่เพิ่มภายหลังควรใช้สี semantic เช่น `bg-background`, `text-foreground`, `border-border`
  และขนาดตัวอักษรหน่วย `rem` เพื่อรองรับการตั้งค่าร่วมกัน รูปภาพ วิดีโอ และฉาก WebGL คงสีเดิม

ตรวจตรรกะค่าการอ่านและคำแปลด้วย `bun test tests/ui-preferences.test.mjs`

## สถิติการเข้าชมเว็บ

Footer แสดงยอดเข้าชมสะสมและยอดวันนี้ โดยแบ่งวันตามเวลา `Asia/Bangkok`
นับการเปิดหน้าเว็บหรือรีเฟรชที่เป็น HTML GET รวมหน้าแรกและหน้า `/th/...`
ไม่นับ API, ไฟล์ประกอบเว็บ, prefetch หรือ RSC fetch จากการเปลี่ยนหน้า/เปลี่ยน query ในแอป
หน้า `/th/heart` ที่ redirect จะนับเมื่อเปิดหน้าปลายทางแทน

- ตั้งค่า `VISITOR_TRACKING_SECRET`, `DATABASE_NAME` และ `nana_technology_MONGODB_URI` ใน environment
- Proxy ส่งบันทึกไป `POST /api/visitor` แบบ background โดยตรวจ shared secret ฝั่งเซิร์ฟเวอร์
- `visitor_events` เก็บบันทึกเดิมพร้อม IP ที่ hash แล้ว
- `visitor_stats` เก็บเอกสาร `_id: "site"` พร้อม `total`, ยอด `daily` แยกวันที่ `YYYY-MM-DD`, `createdAt` และ `updatedAt`
- ครั้งแรกจะรวมบันทึกเก่าที่มีใน `visitor_events` เป็นยอดเริ่มต้น แล้วเพิ่มบันทึกและยอดใหม่ใน MongoDB transaction เดียวกัน
  จึงต้องใช้ MongoDB replica set หรือ MongoDB Atlas ยอดก่อนเริ่มมีบันทึกจะไม่สามารถกู้คืนได้
- `GET /api/visitor` เปิดเผยเฉพาะ `{ total, today, date }` และไม่ cache
  Footer อ่านใหม่ทุก 60 วินาทีและเมื่อกลับมาที่แท็บ หาก DB ใช้งานไม่ได้จะไม่แสดงยอดศูนย์แทนข้อมูลจริง

ทดสอบจำนวนพร้อมกัน การนำยอดเก่ามารวม และการข้ามเที่ยงคืนเวลาไทยด้วย
`bun --env-file=.env.local --conditions=react-server test --timeout=60000 tests/visitor-stats.test.mjs`
การทดสอบใช้เฉพาะ collection ชั่วคราวที่มี prefix `codex_visitor_test_` ในฐานข้อมูล `development`

## กระดานคะแนนเกมหัวใจ

- เปิด `/th/heart/leaderboard` หรือเมนู “กระดานคะแนน” ได้โดยไม่ต้องเข้าสู่ระบบหรือใส่รหัสผ่าน เช่นเดียวกับหน้าเกมใน `/th`
- แสดง 50 อันดับแรกจากคะแนนสูงสุดตลอดการเล่นที่บันทึกใน `heart_game` โดยแต่ละผู้เล่นแสดงหนึ่งรายการ คะแนนเท่ากันใช้อันดับเดียวกัน (เช่น 1, 1, 3)
- ผู้เล่น Guest/Named แยกด้วย `playerId`; คะแนนบัญชีที่ไม่มี `playerId` และข้อมูลเก่าแยกด้วยชื่อที่บันทึกไว้ Guest คนละรหัสจึงมีชื่อซ้ำกันได้
- แสดงเฉพาะชื่อ คะแนน และอันดับ ไม่แสดงรหัสผู้เล่นหรือข้อมูลพื้นที่ส่วนตัว ข้อมูลอัปเดตเมื่อเปิดหน้าหรือกดรีเฟรช
- ใช้คะแนนที่บันทึกเมื่อจบเกม ไม่ใช่คะแนนระหว่างเล่น และยังใช้การตรวจสอบคะแนนเดิมของเกม
- ตรวจการจัดอันดับด้วย `npm run test:leaderboard` โดยต้องตั้ง `DATABASE_NAME=development` ใน `.env.local`; ใช้ collection ชั่วคราวแยกจากข้อมูลจริงและลบเมื่อจบการทดสอบ

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

### Path authentication and password storage

Private paths use NextAuth credentials sessions and Argon2id password hashes
(`m=19456`, `t=2`, `p=1`, random salts). Store credentials in `user.pinHash`;
public user objects never include credentials. Successful legacy logins upgrade
an existing plaintext `user.pin` atomically and remove that field.

Missing-path requests store `newUser.pinHash`. Repeating the same password does
not increment `pinChangeCount`; changing it does. When approving a request,
copy the encoded hash into `user.pinHash` without recovering or copying a
plaintext password. `logOnUser` keeps counters and Thai timestamps and never
stores attempted passwords.

The NextAuth provider limits all credential attempts, including direct auth API
calls, to 10 per path and 50 per client IP within 15 minutes. MongoDB stores
atomic counters in `path_access_attempts` with a TTL index, so limits survive
restarts and work across instances. Proxy deployments must provide trustworthy
`x-forwarded-for` / `x-real-ip` headers. Unknown IPs share a fallback bucket.
An existing valid session for the same path bypasses a new credential attempt.

The current local database is `development` via `.env.local`; configure `DATABASE_NAME`
explicitly for other environments. To migrate existing plaintext credentials
and remove old `logOnUser.wrongpass` fields, first run a dry run against the
intended database, then apply:

```bash
npm run migrate:path-pins -- --dry-run
npm run migrate:path-pins -- --apply
```

The migration preserves password values and unrelated metadata, prints only
counts, refuses unsupported records in its preflight, and uses conditional
updates to avoid overwriting concurrent changes. It is safe to rerun. Deploy
the hash-capable application before migrating another environment.

Run the authentication integration tests with `DATABASE_NAME=development` and database
credentials in `.env.local`:

```bash
npm run test:auth
```

Tests use disposable collections prefixed with `codex_auth_test_` inside `development`
and drop only their own collections afterward. They cover hash verification,
legacy upgrades, credential-free logs, password-change tracking, migration,
atomic throttling, direct provider calls, and session reuse/replacement.

### Admin user creation

Open `/admin` and sign in with a separate administrator account. Provision that
account once from a trusted terminal, explicitly selecting the configured database:

```bash
npm run create:admin -- --database=development
```

The command creates `user.name=admin` with `role=admin`, prints a random password
once, and refuses to overwrite an existing account. It uses the existing database
configuration; no new environment variables are required. For another environment,
replace `development` with that environment's `DATABASE_NAME`.

The admin page and all management actions check the current database role;
normal path users cannot manage users. Removing the admin role immediately blocks
management actions, including with an existing session. Admin login uses the same
MongoDB-backed attempt limits and does not create pending requests for unknown names.

The form creates normal users with a normalized path name, an Argon2id password
hash, optional descriptive `type`, and up to 20 HTTP(S) music/video links with optional
scores from 0 to 10. New passwords require at least 8 characters. Names `admin`, `api`,
`th`, and `_next` are reserved. A unique `user.name` index prevents concurrent duplicate
creation; existing duplicate names must be resolved before provisioning/creation.
The dashboard summarizes all named accounts, administrators, music/video links,
and successful logins. The searchable list includes every named account with
20 entries per page. Stored hashes/passwords are never included in its projection.
Admin accounts are visible but protected from editing/deletion through this page.
Management forms cannot change roles.

Normal users can be edited (name, type, music and optional new password). Leaving
both password fields empty preserves the current password. Password changes revoke
existing sessions. New accounts receive a random session identity, so deleting and
recreating a name does not restore access for its old token. Legacy sessions continue
until the account is reset or removed. Renaming a user changes their private URL
and revokes existing sessions, including when the old name is later restored;
historical access/game records remain under their original names.

Every deletion requires the exact target name and the current signed-in admin's
password. Verification runs on the server with the same MongoDB-backed attempt limits,
and confirmations are never reusable. Document IDs and revision checks prevent stale
forms from editing or deleting a replacement/changed account. Deletion removes only
the user account; historical logs, pending requests, and game records are retained.
Creating a user sets a new password; it does not approve or copy a pending `newUser`
request.

### Running locally

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
