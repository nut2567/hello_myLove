"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { MdAdd, MdClose, MdDeleteOutline, MdEdit, MdSearch } from "react-icons/md";
import { deleteUser } from "@/app/(site)/admin/actions";
import { FormMessage, UserEditorForm } from "@/components/admin/admin-forms";
import type { AdminFormState, ManagedUser } from "@/lib/admin-users";

const PAGE_SIZE = 20;
const INITIAL_STATE: AdminFormState = { status: "idle", message: "" };
const CONTROL = "pixel-button-secondary min-h-10 gap-2 px-3 text-xs focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-40";

function AdminDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>("input:not([type=hidden])")?.focus();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} aria-labelledby="admin-dialog-title" onCancel={onClose} className="pixel-panel m-auto max-h-[90dvh] w-[calc(100%_-_3rem)] max-w-2xl overflow-y-auto p-5 text-white backdrop:bg-black/80 backdrop:backdrop-blur-sm sm:p-7">
    <div className="flex items-start justify-between gap-4"><h2 id="admin-dialog-title" className="break-words text-xl font-bold">{title}</h2><button type="button" className="shrink-0 p-1 text-cyan-200 focus-visible:outline-2" aria-label="ปิดหน้าต่าง" onClick={onClose}><MdClose size={24} aria-hidden /></button></div>
    {children}
  </dialog>;
}

function DeleteUserForm({ user, onDeleted }: { user: ManagedUser; onDeleted: (message: string) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmName, setConfirmName] = useState("");
  const [state, action, pending] = useActionState(async (previous: AdminFormState, formData: FormData) => {
    const result = await deleteUser(previous, formData);
    formRef.current?.reset();
    if (result.status === "success") onDeleted(result.message);
    return result;
  }, INITIAL_STATE);
  return <form action={action} ref={formRef} className="mt-5 grid gap-5">
    <input type="hidden" name="originalName" value={user.name} /><input type="hidden" name="userId" value={user.id} /><input type="hidden" name="revisionId" value={user.revisionId} />
    <p className="text-sm leading-6 text-fuchsia-200">ผู้ใช้ <strong className="break-all">{user.name}</strong> จะถูกลบ และเข้าใช้งานหน้าเฉพาะไม่ได้อีก</p>
    <fieldset disabled={pending} className="grid min-w-0 gap-5 disabled:opacity-60">
      <label className="grid gap-2 text-sm" htmlFor="delete-confirm-name">พิมพ์ชื่อผู้ใช้ที่จะลบ
        <input id="delete-confirm-name" className="pixel-input w-full px-3 py-3 text-sm" name="confirmName" value={confirmName} onChange={event => setConfirmName(event.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} required aria-describedby="delete-name-help" />
        <span id="delete-name-help" className="break-all text-xs leading-5 text-muted-foreground">กรอก {user.name} ให้ตรงทุกตัว</span>
      </label>
      <label className="grid gap-2 text-sm" htmlFor="delete-admin-pin">รหัสผ่านของบัญชี admin
        <input id="delete-admin-pin" className="pixel-input w-full px-3 py-3 text-sm" name="adminPin" type="password" autoComplete="current-password" maxLength={1024} required />
      </label>
    </fieldset>
    <FormMessage state={state} />
    <button type="submit" disabled={pending || confirmName !== user.name} className={`${CONTROL} min-h-12 border-fuchsia-300 text-fuchsia-200`}><MdDeleteOutline size={22} aria-hidden />{pending ? "กำลังยืนยันและลบ…" : "ยืนยันลบผู้ใช้"}</button>
  </form>;
}

export function UserManager({ users }: { users: ManagedUser[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<{ mode: "create" | "edit" | "delete"; user?: ManagedUser } | null>(null);
  const [notice, setNotice] = useState("");
  const filtered = users.filter(user => `${user.name} ${user.type ?? ""} ${user.role} ${user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}`.toLowerCase().includes(search.trim().toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedUser = selection?.user;
  function saved(message: string) { setNotice(message); setSelection(null); }
  return <section className="min-w-0" aria-labelledby="user-list-title">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h2 id="user-list-title" className="text-xl font-bold sm:text-2xl">ผู้ใช้ทั้งหมด</h2><p className="mt-2 text-sm text-muted-foreground">ค้นหาและจัดการข้อมูลผู้ใช้ได้จากรายการนี้</p></div>
      <button type="button" onClick={() => { setNotice(""); setSelection({ mode: "create" }); }} className="pixel-button min-h-12 gap-2 px-5 text-sm focus-visible:outline-2 focus-visible:outline-offset-4"><MdAdd size={22} aria-hidden />เพิ่มผู้ใช้</button>
    </div>
    <label className="relative mt-6 block max-w-lg" htmlFor="user-search"><MdSearch size={22} aria-hidden className="pointer-events-none absolute left-4 top-4 text-cyan-200" /><span className="sr-only">ค้นหาผู้ใช้</span><input id="user-search" className="pixel-input w-full py-3 pl-12 pr-3 text-sm" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="ค้นหาชื่อ ประเภท หรือสิทธิ์ผู้ใช้" /></label>
    {notice && <div className="mt-5"><FormMessage state={{ status: "success", message: notice }} /></div>}
    <p className="mt-5 text-xs text-muted-foreground">พบ {filtered.length} คน จากทั้งหมด {users.length} คน</p>
    <ul className="mt-4 divide-y-2 divide-white/20 border-y-2 border-white/20">
      {visible.map(user => <li key={user.id} className="grid min-w-0 gap-4 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0"><p className="break-all font-mono font-bold text-cyan-200">{user.name}</p><p className="mt-2 break-words text-xs leading-5 text-muted-foreground">{user.type || "ยังไม่ระบุประเภท"} · {user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}</p></div>
        <div className="text-xs leading-6 text-muted-foreground"><p>เพลง / วิดีโอ {user.music.length} ลิงก์</p><p>แก้ไขล่าสุด {user.updatedAt ?? user.createdAt ?? "ยังไม่มีข้อมูล"}</p></div>
        {user.role === "admin" ? <span className="w-fit border-2 border-cyan-200/40 px-3 py-2 text-xs text-cyan-200">บัญชี admin ที่ได้รับการป้องกัน</span> : <div className="flex gap-3"><button type="button" className={CONTROL} aria-label={`แก้ไข ${user.name}`} onClick={() => { setNotice(""); setSelection({ mode: "edit", user }); }}><MdEdit size={17} aria-hidden />แก้ไข</button><button type="button" className={`${CONTROL} text-fuchsia-200`} aria-label={`ลบ ${user.name}`} onClick={() => { setNotice(""); setSelection({ mode: "delete", user }); }}><MdDeleteOutline size={18} aria-hidden />ลบ</button></div>}
      </li>)}
    </ul>
    {!visible.length && <p className="py-8 text-sm text-muted-foreground">ไม่พบผู้ใช้ ลองค้นหาด้วยชื่ออื่นหรือเพิ่มผู้ใช้ใหม่</p>}
    <nav aria-label="หน้ารายการผู้ใช้" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs"><span>หน้า {currentPage} / {pageCount}</span><div className="flex gap-3"><button type="button" className={CONTROL} disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>ก่อนหน้า</button><button type="button" className={CONTROL} disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>ถัดไป</button></div></nav>
    {selection?.mode === "create" && <AdminDialog title="เพิ่มผู้ใช้" onClose={() => setSelection(null)}><UserEditorForm onSaved={saved} /></AdminDialog>}
    {selection?.mode === "edit" && selectedUser && <AdminDialog title={`แก้ไขผู้ใช้ ${selectedUser.name}`} onClose={() => setSelection(null)}><UserEditorForm key={selectedUser.id} user={selectedUser} onSaved={saved} /></AdminDialog>}
    {selection?.mode === "delete" && selectedUser && <AdminDialog title={`ยืนยันลบผู้ใช้ ${selectedUser.name}`} onClose={() => setSelection(null)}><DeleteUserForm key={selectedUser.id} user={selectedUser} onDeleted={saved} /></AdminDialog>}
  </section>;
}
