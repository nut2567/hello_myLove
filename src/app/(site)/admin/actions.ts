"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { CredentialsSignin } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { createManagedUser, updateManagedUser, deleteManagedUser, type AdminFormState } from "@/lib/admin-users";
import { normalizePathNameValue } from "@/lib/path-access";
import { normalizePathPin } from "@/lib/path-password";

export async function loginAdmin(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const name = normalizePathNameValue(formData.get("name"));
  const pin = normalizePathPin(formData.get("pin"));
  if (!name || !pin) return { status: "error", message: "กรุณากรอกชื่อบัญชีและรหัสผ่าน" };
  try {
    await signIn("admin-access", { path: name, pin, recaptchaToken: formData.get("recaptchaToken"), redirectTo: "/admin" });
  } catch (error) {
    if (!(error instanceof CredentialsSignin)) throw error;
    return {
      status: "error",
      message: error.code === "captcha-required"
        ? "ยืนยัน reCAPTCHA ไม่สำเร็จ กรุณายืนยันใหม่แล้วลองอีกครั้ง"
        : error.code === "rate-limited"
        ? "ลองเข้าสู่ระบบเกินจำนวนที่กำหนด กรุณารอ 15 นาทีแล้วลองใหม่"
        : "ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีนี้ไม่มีสิทธิ์ admin",
    };
  }
  return { status: "idle", message: "" };
}

export async function createUser(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const session = await auth();
  if (!session?.user?.adminCaptchaVerified) return { status: "error", message: "กรุณาเข้าสู่ระบบแอดมินและยืนยัน reCAPTCHA ใหม่" };
  let result: AdminFormState;
  try {
    result = await createManagedUser(session?.user?.pathName, formData);
  } catch {
    // Never return driver errors or submitted passwords to the client.
    return { status: "error", message: "สร้างผู้ใช้ไม่สำเร็จ กรุณาลองใหม่หรือตรวจการเชื่อมต่อฐานข้อมูล" };
  }
  if (result.status === "success") revalidatePath("/admin");
  return result;
}

export async function logoutAdmin() {
  await signOut({ redirectTo: "/admin" });
}

export async function updateUser(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const session = await auth();
  if (!session?.user?.adminCaptchaVerified) return { status: "error", message: "กรุณาเข้าสู่ระบบแอดมินและยืนยัน reCAPTCHA ใหม่" };
  let result: AdminFormState;
  try {
    result = await updateManagedUser(session?.user?.pathName, formData);
  } catch {
    return { status: "error", message: "บันทึกไม่สำเร็จ กรุณาลองใหม่หรือตรวจการเชื่อมต่อฐานข้อมูล" };
  }
  if (result.status === "success") { revalidatePath("/admin"); revalidatePath("/", "layout"); }
  return result;
}

export async function deleteUser(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const session = await auth();
  if (!session?.user?.adminCaptchaVerified) return { status: "error", message: "กรุณาเข้าสู่ระบบแอดมินและยืนยัน reCAPTCHA ใหม่" };
  let result: AdminFormState;
  try {
    result = await deleteManagedUser(session?.user?.pathName, formData, new Headers(await headers()));
  } catch {
    return { status: "error", message: "ลบไม่สำเร็จ กรุณาลองใหม่หรือตรวจการเชื่อมต่อฐานข้อมูล" };
  }
  if (result.status === "success") { revalidatePath("/admin"); revalidatePath("/", "layout"); }
  return result;
}
