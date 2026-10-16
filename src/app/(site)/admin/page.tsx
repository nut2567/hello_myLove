
import { TranslatedText } from "@/components/translated-text";

import type { Metadata } from "next";
import Link from "next/link";
import { MdAdminPanelSettings, MdLogout, MdGroup, MdLibraryMusic, MdLogin } from "react-icons/md";
import { auth } from "@/auth";
import { AdminLoginForm } from "@/components/admin/admin-forms";
import { UserManager } from "@/components/admin/user-manager";
import { getAdminByName, listManagedUsers } from "@/lib/admin-users";
import { logoutAdmin } from "./actions";
import { getRecaptchaSiteKey } from "@/lib/recaptcha";

export const metadata: Metadata = { title: "จัดการผู้ใช้", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = await auth();
  const admin = session?.user?.adminCaptchaVerified
    ? await getAdminByName(session.user.pathName) : null;
  if (!admin) {
    return (
      <section className="mx-auto flex w-full max-w-lg flex-1 items-center px-6 py-14">
        <div className="pixel-panel w-full p-6 sm:p-8">
          <MdAdminPanelSettings className="text-cyan-200" size={42} aria-hidden />
          <h1 className="mt-4 text-2xl font-bold"><TranslatedText messageKey={"Admin.title"} /></h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground"><TranslatedText messageKey={"Admin.signInWithAnAdminAccountToCreateUsersAnd"} /></p>
          <AdminLoginForm siteKey={getRecaptchaSiteKey()} />
          <Link className="mt-6 inline-block text-sm text-cyan-200 underline underline-offset-4" href="/"><TranslatedText messageKey={"Admin.backToHome"} /></Link>
        </div>
      </section>
    );
  }
  const { users, summary } = await listManagedUsers(admin.name);
  const metrics = [
    { label: "ผู้ใช้ทั้งหมด", value: summary.total, icon: MdGroup },
    { label: "ผู้ดูแลระบบ", value: summary.admins, icon: MdAdminPanelSettings },
    { label: "เพลง / วิดีโอ", value: summary.links, icon: MdLibraryMusic },
    { label: "เข้าสู่ระบบสำเร็จ", value: summary.successfulLogins, icon: MdLogin },
  ];
  return (
    <section className="container mx-auto px-6 py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <MdAdminPanelSettings className="shrink-0 text-cyan-200" size={40} aria-hidden />
          <div><h1 className="text-2xl font-bold sm:text-3xl"><TranslatedText messageKey={"Admin.title"} /></h1><p className="mt-2 text-sm text-muted-foreground"><TranslatedText messageKey={"Admin.signedInAs"} after=" " />{admin.name}</p></div>
        </div>
        <form action={logoutAdmin}><button className="pixel-button-secondary min-h-11 gap-2 px-4 text-xs focus-visible:outline-2 focus-visible:outline-offset-4" type="submit"><MdLogout size={18} aria-hidden /><TranslatedText messageKey={"Admin.signOut"} /></button></form>
      </header>
      <dl aria-label="สรุปข้อมูลผู้ใช้" className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map(metric => <div key={metric.label} className="min-w-0 border-t-4 border-cyan-200 bg-black/50 p-4 sm:p-5"><dt className="flex items-center gap-2 text-xs leading-5 text-muted-foreground sm:text-sm"><metric.icon size={20} aria-hidden className="shrink-0 text-cyan-200" /><TranslatedText messageKey={metric.label} /></dt><dd className="mt-3 font-mono text-3xl font-bold text-lime-200 sm:text-4xl">{metric.value.toLocaleString("en-US")}</dd></div>)}
      </dl>
      <div className="pixel-panel min-w-0 p-5 sm:p-7">
        <UserManager users={users} />
      </div>
    </section>
  );
}
