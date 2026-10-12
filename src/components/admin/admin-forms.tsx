"use client";

import { useActionState, useRef, useState } from "react";
import { MdAdd, MdDeleteOutline, MdPersonAdd, MdLogin, MdSave } from "react-icons/md";
import { createUser, loginAdmin, updateUser } from "@/app/(site)/admin/actions";
import type { AdminFormState, ManagedUser } from "@/lib/admin-users";

const INITIAL_STATE: AdminFormState = { status: "idle", message: "" };
const INPUT_CLASS = "pixel-input w-full px-3 py-3 text-sm";
const BUTTON_CLASS = "pixel-button min-h-12 gap-2 px-5 text-sm disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200";

export function FormMessage({ state }: { state: AdminFormState }) {
  if (!state.message) return null;
  return <p role={state.status === "error" ? "alert" : "status"} className={`border-l-4 px-4 py-3 text-sm leading-6 ${state.status === "error" ? "border-fuchsia-300 bg-fuchsia-950/40 text-fuchsia-200" : "border-lime-300 bg-lime-950/40 text-lime-200"}`}>{state.message}</p>;
}

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, INITIAL_STATE);
  return (
    <form action={action} className="mt-7 grid gap-5">
      <label className="grid gap-2 text-sm" htmlFor="admin-name">ชื่อบัญชี admin
        <input className={INPUT_CLASS} id="admin-name" name="name" autoComplete="username" autoCapitalize="none" spellCheck={false} defaultValue="admin" required maxLength={64} />
      </label>
      <label className="grid gap-2 text-sm" htmlFor="admin-pin">รหัสผ่าน
        <input className={INPUT_CLASS} id="admin-pin" name="pin" type="password" autoComplete="current-password" required />
      </label>
      <FormMessage state={state} />
      <button className={BUTTON_CLASS} disabled={pending} type="submit"><MdLogin aria-hidden size={21} />{pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ admin"}</button>
    </form>
  );
}

export function UserEditorForm({ user, onSaved }: { user?: ManagedUser; onSaved?: (message: string) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [type, setType] = useState(user?.type ?? "");
  const [music, setMusic] = useState(() => user?.music.length
    ? user.music.map((link, id) => ({ id, url: link.url, rate: link.rate === null ? "" : String(link.rate) }))
    : [{ id: 0, url: "", rate: "" }]);
  const nextId = useRef(music.length);
  const [state, action, pending] = useActionState(async (previous: AdminFormState, formData: FormData) => {
    const result = await (user ? updateUser : createUser)(previous, formData);
    formRef.current?.reset();
    if (result.status === "success") {
      if (!user) { setName(""); setType(""); setMusic([{ id: nextId.current++, url: "", rate: "" }]); }
      onSaved?.(result.message);
    }
    return result;
  }, INITIAL_STATE);
  return (
    <form action={action} ref={formRef} className="mt-7 grid gap-6">
      {user && <><input type="hidden" name="originalName" value={user.name} /><input type="hidden" name="userId" value={user.id} /><input type="hidden" name="revisionId" value={user.revisionId} /></>}
      <fieldset disabled={pending} className="grid min-w-0 gap-5 disabled:opacity-60">
        <label className="grid gap-2 text-sm" htmlFor="new-user-name">ชื่อผู้ใช้
          <input className={INPUT_CLASS} id="new-user-name" name="name" value={name} onChange={event => setName(event.target.value)} placeholder="เช่น nut" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={64} required pattern={"[a-zA-Z0-9_\\-]{1,64}"} aria-describedby="user-name-help" />
          <span id="user-name-help" className="text-xs leading-5 text-muted-foreground">ใช้ a–z, 0–9, _ หรือ - ไม่ต้องใส่ /{name && <> · หน้า /{name.toLowerCase()}</>}</span>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm" htmlFor="new-user-pin">{user ? "รหัสผ่านใหม่" : "รหัสผ่าน"}
            <input className={INPUT_CLASS} id="new-user-pin" name="pin" type="password" minLength={8} maxLength={1024} autoComplete="new-password" placeholder={user ? "เว้นว่างเพื่อใช้รหัสเดิม" : "อย่างน้อย 8 ตัว"} required={!user} />
          </label>
          <label className="grid gap-2 text-sm" htmlFor="new-user-confirm">ยืนยันรหัสผ่าน
            <input className={INPUT_CLASS} id="new-user-confirm" name="confirmPin" type="password" minLength={8} maxLength={1024} autoComplete="new-password" required={!user} />
          </label>
        </div>
        <label className="grid gap-2 text-sm" htmlFor="new-user-type">ประเภทผู้ใช้ <span className="sr-only">ไม่บังคับ</span>
          <input className={INPUT_CLASS} id="new-user-type" name="type" value={type} onChange={event => setType(event.target.value)} maxLength={100} placeholder="เช่น Personal (ไม่บังคับ)" />
        </label>
        <fieldset className="grid min-w-0 gap-4 border-t-2 border-white/20 pt-5">
          <legend className="pr-3 text-sm">ลิงก์เพลง / วิดีโอ <span className="text-xs text-muted-foreground">(ไม่บังคับ)</span></legend>
          {music.map((item, index) => (
            <div key={item.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_6rem]">
                <label className="grid min-w-0 gap-2 text-xs" htmlFor={`music-url-${item.id}`}>ลิงก์ {index + 1}
                  <input className={INPUT_CLASS} id={`music-url-${item.id}`} name="musicUrl" type="url" maxLength={2048} placeholder="https://…" value={item.url} onChange={event => setMusic(music.map(row => row.id === item.id ? { ...row, url: event.target.value } : row))} />
                </label>
                <label className="grid gap-2 text-xs" htmlFor={`music-rate-${item.id}`}>คะแนน / 10
                  <input className={INPUT_CLASS} id={`music-rate-${item.id}`} name="musicRate" type="number" min={0} max={10} step="any" placeholder="—" value={item.rate} onChange={event => setMusic(music.map(row => row.id === item.id ? { ...row, rate: event.target.value } : row))} />
                </label>
              </div>
              <button type="button" className="pixel-button-secondary h-12 w-12 focus-visible:outline-2 focus-visible:outline-offset-4" aria-label={`ลบลิงก์ ${index + 1}`} onClick={() => setMusic(music.filter(row => row.id !== item.id))}><MdDeleteOutline size={21} aria-hidden /></button>
            </div>
          ))}
          <button type="button" className="flex w-fit items-center gap-2 py-2 text-sm text-cyan-200 underline-offset-4 hover:underline focus-visible:outline-2 disabled:opacity-50" disabled={music.length >= 20} onClick={() => setMusic([...music, { id: nextId.current++, url: "", rate: "" }])}><MdAdd size={20} aria-hidden />เพิ่มลิงก์</button>
        </fieldset>
      </fieldset>
      <FormMessage state={state} />
      <button className={BUTTON_CLASS} disabled={pending} type="submit">{user ? <MdSave size={22} aria-hidden /> : <MdPersonAdd size={22} aria-hidden />}{pending ? "กำลังบันทึก…" : user ? "บันทึกการแก้ไข" : "สร้างผู้ใช้"}</button>
    </form>
  );
}
