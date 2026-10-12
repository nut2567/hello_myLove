"use client";

import { useTranslations } from "next-intl";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { MdAdd, MdClose, MdDeleteOutline, MdEdit, MdSearch } from "react-icons/md";
import { deleteUser } from "@/app/(site)/admin/actions";
import { FormMessage, UserEditorForm } from "@/components/admin/admin-forms";
import type { AdminFormState, ManagedUser } from "@/lib/admin-users";

const PAGE_SIZE = 20;
const INITIAL_STATE: AdminFormState = { status: "idle", message: "" };
const CONTROL = "pixel-button-secondary min-h-10 gap-2 px-3 text-xs focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-40";

function AdminDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const t = useTranslations();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>("input:not([type=hidden])")?.focus();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} aria-labelledby="admin-dialog-title" onCancel={onClose} className="pixel-panel m-auto max-h-[90dvh] w-[calc(100%_-_3rem)] max-w-2xl overflow-y-auto p-5 text-white backdrop:bg-black/80 backdrop:backdrop-blur-sm sm:p-7">
    <div className="flex items-start justify-between gap-4"><h2 id="admin-dialog-title" className="break-words text-xl font-bold">{title}</h2><button type="button" className="shrink-0 p-1 text-cyan-200 focus-visible:outline-2" aria-label={t("Common.closeDialog")} onClick={onClose}><MdClose size={24} aria-hidden /></button></div>
    {children}
  </dialog>;
}

function DeleteUserForm({ user, onDeleted }: { user: ManagedUser; onDeleted: (message: string) => void }) {
  const t = useTranslations();
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
    <p className="text-sm leading-6 text-fuchsia-200">{t("Admin.user")}{" "}<strong className="break-all">{user.name}</strong>{" "}{t("Admin.willBeDeletedAndWillLoseAccessToTheirPrivate")}</p>
    <fieldset disabled={pending} className="grid min-w-0 gap-5 disabled:opacity-60">
      <label className="grid gap-2 text-sm" htmlFor="delete-confirm-name">{t("Admin.typeTheUsernameToDelete")}<input id="delete-confirm-name" className="pixel-input w-full px-3 py-3 text-sm" name="confirmName" value={confirmName} onChange={event => setConfirmName(event.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} required aria-describedby="delete-name-help" />
        <span id="delete-name-help" className="break-all text-xs leading-5 text-muted-foreground">{t("Admin.enter")}{" "}{user.name}{" "}{t("Admin.exactlyAsShown")}</span>
      </label>
      <label className="grid gap-2 text-sm" htmlFor="delete-admin-pin">{t("Admin.adminAccountPassword")}<input id="delete-admin-pin" className="pixel-input w-full px-3 py-3 text-sm" name="adminPin" type="password" autoComplete="current-password" maxLength={1024} required />
      </label>
    </fieldset>
    <FormMessage state={state} />
    <button type="submit" disabled={pending || confirmName !== user.name} className={`${CONTROL} min-h-12 border-fuchsia-300 text-fuchsia-200`}><MdDeleteOutline size={22} aria-hidden />{t(pending ? "Admin.confirmingAndDeleting" : "Admin.confirmUserDeletion")}</button>
  </form>;
}

export function UserManager({ users }: { users: ManagedUser[] }) {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<{ mode: "create" | "edit" | "delete"; user?: ManagedUser } | null>(null);
  const [notice, setNotice] = useState("");
  const filtered = users.filter(user => `${user.name} ${user.type ?? ""} ${user.role} ${t(user.role === "admin" ? "Admin.administrator" : "Admin.regularUser")} ${user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}`.toLowerCase().includes(search.trim().toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedUser = selection?.user;
  function saved(message: string) { setNotice(message); setSelection(null); }
  return <section className="min-w-0" aria-labelledby="user-list-title">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h2 id="user-list-title" className="text-xl font-bold sm:text-2xl">{t("Admin.allUsers")}</h2><p className="mt-2 text-sm text-muted-foreground">{t("Admin.searchAndManageUsersInThisList")}</p></div>
      <button type="button" onClick={() => { setNotice(""); setSelection({ mode: "create" }); }} className="pixel-button min-h-12 gap-2 px-5 text-sm focus-visible:outline-2 focus-visible:outline-offset-4"><MdAdd size={22} aria-hidden />{t("Admin.addUser")}</button>
    </div>
    <label className="relative mt-6 block max-w-lg" htmlFor="user-search"><MdSearch size={22} aria-hidden className="pointer-events-none absolute left-4 top-4 text-cyan-200" /><span className="sr-only">{t("Admin.searchUsers")}</span><input id="user-search" className="pixel-input w-full py-3 pl-12 pr-3 text-sm" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder={t("Admin.searchByNameTypeOrRole")} /></label>
    {notice && <div className="mt-5"><FormMessage state={{ status: "success", message: notice }} /></div>}
    <p className="mt-5 text-xs text-muted-foreground">{t("Admin.found")}{" "}{filtered.length}{" "}{t("Admin.usersOutOf")}{" "}{users.length}{" "}{t("Admin.users")}</p>
    <ul className="mt-4 divide-y-2 divide-white/20 border-y-2 border-white/20">
      {visible.map(user => <li key={user.id} className="grid min-w-0 gap-4 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0"><p className="break-all font-mono font-bold text-cyan-200">{user.name}</p><p className="mt-2 break-words text-xs leading-5 text-muted-foreground">{user.type || t("Admin.noTypeSpecified")} · {t(user.role === "admin" ? "Admin.administrator" : "Admin.regularUser")}</p></div>
        <div className="text-xs leading-6 text-muted-foreground"><p>{t("Admin.musicVideos")}{" "}{user.music.length}{" "}{t("Admin.link")}</p><p>{t("Admin.lastUpdated")}{" "}{user.updatedAt ?? user.createdAt ?? t("Admin.noDataYet")}</p></div>
        {user.role === "admin" ? <span className="w-fit border-2 border-cyan-200/40 px-3 py-2 text-xs text-cyan-200">{t("Admin.protectedAdminAccount")}</span> : <div className="flex gap-3"><button type="button" className={CONTROL} aria-label={`${t("Admin.edit")} ${user.name}`} onClick={() => { setNotice(""); setSelection({ mode: "edit", user }); }}><MdEdit size={17} aria-hidden />{t("Admin.edit")}</button><button type="button" className={`${CONTROL} text-fuchsia-200`} aria-label={`${t("Admin.delete")} ${user.name}`} onClick={() => { setNotice(""); setSelection({ mode: "delete", user }); }}><MdDeleteOutline size={18} aria-hidden />{t("Admin.delete")}</button></div>}
      </li>)}
    </ul>
    {!visible.length && <p className="py-8 text-sm text-muted-foreground">{t("Admin.noUsersFoundTryAnotherNameOrAddAUser")}</p>}
    <nav aria-label={t("Admin.userListPagination")} className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs"><span>{t("Admin.page2")}{" "}{currentPage} / {pageCount}</span><div className="flex gap-3"><button type="button" className={CONTROL} disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>{t("Admin.previous")}</button><button type="button" className={CONTROL} disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>{t("Admin.next")}</button></div></nav>
    {selection?.mode === "create" && <AdminDialog title={t("Admin.addUser")} onClose={() => setSelection(null)}><UserEditorForm onSaved={saved} /></AdminDialog>}
    {selection?.mode === "edit" && selectedUser && <AdminDialog title={`${t("Admin.edit")} ${t("Admin.user")} ${selectedUser.name}`} onClose={() => setSelection(null)}><UserEditorForm key={selectedUser.id} user={selectedUser} onSaved={saved} /></AdminDialog>}
    {selection?.mode === "delete" && selectedUser && <AdminDialog title={`${t("Admin.confirmUserDeletion")} ${selectedUser.name}`} onClose={() => setSelection(null)}><DeleteUserForm key={selectedUser.id} user={selectedUser} onDeleted={saved} /></AdminDialog>}
  </section>;
}
