import "server-only";

import { randomUUID } from "node:crypto";
import { MongoServerError } from "mongodb";
import { getCurrentThaiDateTimeString } from "@/lib/date-time";
import { getMongoClient, getMongoDatabase } from "@/lib/mongodb";
import { getDatabaseName, getPathCredentialIdentity, logExistingPathUserAccess, normalizePathNameValue, type PathLink } from "@/lib/path-access";
import { reservePathAccessAttempt } from "@/lib/path-access-throttle";
import { hashPathPin, normalizePathPin } from "@/lib/path-password";

const RESERVED_NAMES = new Set(["admin", "api", "th", "_next"]);

export type AdminFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export async function getAdminByName(value: unknown): Promise<{ name: string } | null> {
  const name = normalizePathNameValue(value);
  if (!name) return null;
  const database = await getMongoDatabase();
  const user = await database.collection("user").findOne(
    { name, role: "admin" }, { projection: { _id: 0, name: 1 } },
  );
  return user ? { name } : null;
}

export async function authenticateAdminUser({ name, pin, headers, logAccess = true }: {
  name: string; pin: string; headers: Headers; logAccess?: boolean;
}) {
  const client = await getMongoClient();
  if (!await reservePathAccessAttempt({ client, databaseName: getDatabaseName(), name, headers })) {
    return { status: "rate-limited" as const };
  }
  const admin = await getAdminByName(name);
  const identity = admin ? await getPathCredentialIdentity({ name, pin }) : null;
  if (admin && logAccess) {
    try {
      await logExistingPathUserAccess({ name, passwordCorrect: Boolean(identity) });
    } catch {
      console.error("Failed to save admin access result.");
    }
  }
  // Unknown admin names never create pending user requests.
  return identity ? { status: "authenticated" as const, ...identity } : { status: "invalid-password" as const };
}

export async function ensureUserNameIndex() {
  const database = await getMongoDatabase();
  await database.collection("user").createIndex({ name: 1 }, {
    name: "user_name_unique", unique: true,
    partialFilterExpression: { name: { $type: "string" } },
  });
}

function failure(message: string): AdminFormState {
  return { status: "error", message };
}

function parseUserForm(formData: FormData, passwordRequired: boolean) {
  const name = normalizePathNameValue(formData.get("name"));
  if (!name) return { error: failure("ชื่อผู้ใช้ต้องมี 1–64 ตัว ใช้ a–z, 0–9, _ หรือ - เท่านั้น") };
  if (RESERVED_NAMES.has(name)) return { error: failure("ชื่อนี้ใช้สำหรับหน้าของระบบ กรุณาเลือกชื่ออื่น") };
  const rawPin = formData.get("pin");
  const rawConfirmation = formData.get("confirmPin");
  const pin = normalizePathPin(formData.get("pin"));
  const confirmation = normalizePathPin(formData.get("confirmPin"));
  const changingPassword = passwordRequired || rawPin !== "" || rawConfirmation !== "";
  if (changingPassword && (!pin || Array.from(pin).length < 8)) return { error: failure("รหัสผ่านต้องมีอย่างน้อย 8 ตัว และไม่เกิน 1,024 ไบต์") };
  if (changingPassword && pin !== confirmation) return { error: failure("รหัสผ่านและรหัสยืนยันไม่ตรงกัน") };
  const rawType = formData.get("type");
  if (typeof rawType !== "string" || rawType.trim().length > 100) return { error: failure("ประเภทผู้ใช้ต้องไม่เกิน 100 ตัว") };
  const urls = formData.getAll("musicUrl");
  const rates = formData.getAll("musicRate");
  if (urls.length > 20 || urls.length !== rates.length) return { error: failure("เพิ่มลิงก์เพลงได้ไม่เกิน 20 รายการ") };
  const music: PathLink[] = [];
  for (let index = 0; index < urls.length; index += 1) {
    const rawUrl = urls[index];
    const rawRate = rates[index];
    if (typeof rawUrl !== "string" || typeof rawRate !== "string") return { error: failure("ข้อมูลลิงก์เพลงไม่ถูกต้อง") };
    const url = rawUrl.trim();
    const rateText = rawRate.trim();
    if (!url && !rateText) continue;
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || url.length > 2048) throw new Error();
    } catch {
      return { error: failure(`ลิงก์เพลงรายการที่ ${index + 1} ต้องเป็น URL แบบ http หรือ https`) };
    }
    const rate = rateText === "" ? null : Number(rateText);
    if (rate !== null && (!Number.isFinite(rate) || rate < 0 || rate > 10)) return { error: failure("คะแนนเพลงต้องอยู่ระหว่าง 0 ถึง 10 หรือเว้นว่าง") };
    music.push({ url, rate });
  }
  return { data: { name, pin: changingPassword ? pin : null, type: rawType.trim() || null, music } };
}

export async function createManagedUser(actorName: unknown, formData: FormData): Promise<AdminFormState> {
  const admin = await getAdminByName(actorName);
  if (!admin) return failure("กรุณาเข้าสู่ระบบด้วยบัญชี admin ก่อนสร้างผู้ใช้");
  const parsed = parseUserForm(formData, true);
  if (parsed.error) return parsed.error;
  const { name, pin, type, music } = parsed.data;
  if (!pin) return failure("กรุณากรอกรหัสผ่าน");
  const database = await getMongoDatabase();
  // Check first for helpful feedback, then enforce uniqueness atomically with the index.
  if (await database.collection("user").findOne({ name }, { projection: { _id: 1 } })) return failure("ชื่อผู้ใช้นี้มีอยู่แล้ว กรุณาเลือกชื่ออื่น");
  await ensureUserNameIndex();
  const pinHash = await hashPathPin(pin);
  try {
    await database.collection("user").insertOne({
      name, pinHash, type, music, sessionId: randomUUID(), revisionId: randomUUID(),
      role: "user", createdAt: getCurrentThaiDateTimeString(), createdBy: admin.name,
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return failure("ชื่อผู้ใช้นี้มีอยู่แล้ว กรุณาเลือกชื่ออื่น");
    throw error;
  }
  return { status: "success", message: `สร้างผู้ใช้ ${name} แล้ว เข้า /${name} ด้วยรหัสที่ตั้งไว้ได้เลย` };
}

export type ManagedUser = {
  id: string;
  name: string;
  type: string | null;
  music: PathLink[];
  role: "admin" | "user";
  revisionId: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export async function listManagedUsers(actorName: unknown) {
  if (!await getAdminByName(actorName)) throw new Error("Admin access required.");
  const database = await getMongoDatabase();
  const [documents, accessTotals] = await Promise.all([
    database.collection("user").find({ name: { $type: "string" } }, {
      projection: { name: 1, type: 1, music: 1, role: 1, revisionId: 1, createdAt: 1, updatedAt: 1 },
    }).sort({ name: 1 }).toArray(),
    database.collection("logOnUser").aggregate<{ successCount: number }>([
      { $group: { _id: null, successCount: { $sum: "$successCount" } } },
    ]).toArray(),
  ]);
  const users: ManagedUser[] = documents.map(user => ({
    id: String(user._id), name: String(user.name),
    type: typeof user.type === "string" ? user.type : null,
    role: user.role === "admin" ? "admin" : "user",
    revisionId: typeof user.revisionId === "string" ? user.revisionId : "",
    createdAt: typeof user.createdAt === "string" ? user.createdAt : null,
    updatedAt: typeof user.updatedAt === "string" ? user.updatedAt : null,
    music: Array.isArray(user.music) ? user.music.filter((link: unknown): link is PathLink => {
      if (typeof link !== "object" || !link) return false;
      const item = link as Partial<PathLink>;
      return typeof item.url === "string" && /^https?:\/\//.test(item.url);
    }).map((link: PathLink) => ({ url: link.url, rate: typeof link.rate === "number" && Number.isFinite(link.rate) ? link.rate : null })) : [],
  }));
  return {
    total: users.length, users,
    summary: {
      total: users.length, admins: users.filter(user => user.role === "admin").length,
      links: users.reduce((sum, user) => sum + user.music.length, 0),
      successfulLogins: accessTotals[0]?.successCount ?? 0,
    },
  };
}

async function findMutationTarget(formData: FormData) {
  const originalName = normalizePathNameValue(formData.get("originalName"));
  const id = formData.get("userId");
  const revisionId = formData.get("revisionId");
  if (!originalName || typeof id !== "string" || typeof revisionId !== "string") return null;
  const database = await getMongoDatabase();
  const user = await database.collection("user").findOne({ name: originalName }, {
    projection: { name: 1, role: 1, revisionId: 1 },
  });
  if (!user || String(user._id) !== id || (user.revisionId ?? "") !== revisionId) return null;
  return user;
}

function targetFilter(user: NonNullable<Awaited<ReturnType<typeof findMutationTarget>>>) {
  return {
    _id: user._id, name: user.name, role: { $ne: "admin" },
    revisionId: user.revisionId === undefined ? { $exists: false } : { $eq: user.revisionId },
  };
}

export async function updateManagedUser(actorName: unknown, formData: FormData): Promise<AdminFormState> {
  const admin = await getAdminByName(actorName);
  if (!admin) return failure("กรุณาเข้าสู่ระบบด้วยบัญชี admin ก่อนแก้ไขผู้ใช้");
  const target = await findMutationTarget(formData);
  if (!target) return failure("ข้อมูลผู้ใช้เปลี่ยนไปแล้ว กรุณาโหลดรายการใหม่");
  if (target.role === "admin") return failure("บัญชี admin ได้รับการป้องกันการแก้ไขจากหน้านี้");
  const parsed = parseUserForm(formData, false);
  if (parsed.error) return parsed.error;
  const { name, pin, type, music } = parsed.data;
  const database = await getMongoDatabase();
  await ensureUserNameIndex();
  const update = {
    name, type, music, updatedAt: getCurrentThaiDateTimeString(), updatedBy: admin.name,
    revisionId: randomUUID(),
    ...(pin ? { pinHash: await hashPathPin(pin) } : {}),
    ...(pin || name !== target.name ? { sessionId: randomUUID() } : {}),
  };
  try {
    const result = await database.collection("user").updateOne(targetFilter(target), {
      $set: update, ...(pin ? { $unset: { pin: "" } } : {}),
    });
    if (!result.matchedCount) return failure("ข้อมูลผู้ใช้เปลี่ยนไปแล้ว กรุณาโหลดรายการใหม่");
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return failure("ชื่อผู้ใช้นี้มีอยู่แล้ว กรุณาเลือกชื่ออื่น");
    throw error;
  }
  return { status: "success", message: `บันทึกข้อมูลผู้ใช้ ${name} แล้ว` };
}

export async function deleteManagedUser(actorName: unknown, formData: FormData, headers: Headers): Promise<AdminFormState> {
  const admin = await getAdminByName(actorName);
  if (!admin) return failure("กรุณาเข้าสู่ระบบด้วยบัญชี admin ก่อนลบผู้ใช้");
  const target = await findMutationTarget(formData);
  if (!target) return failure("ข้อมูลผู้ใช้เปลี่ยนไปแล้ว กรุณาโหลดรายการใหม่");
  if (target.role === "admin") return failure("ไม่สามารถลบบัญชี admin จากหน้านี้ได้");
  // Require the exact current name and freshly verify the signed-in administrator's password.
  if (formData.get("confirmName") !== target.name) return failure("ชื่อที่กรอกยืนยันไม่ตรงกับผู้ใช้ที่จะลบ");
  const pin = normalizePathPin(formData.get("adminPin"));
  if (!pin) return failure("กรุณากรอกรหัสผ่านของบัญชี admin เพื่อยืนยันการลบ");
  const verification = await authenticateAdminUser({ name: admin.name, pin, headers, logAccess: false });
  if (verification.status === "rate-limited") return failure("ลองยืนยันรหัสเกินจำนวนที่กำหนด กรุณารอ 15 นาทีแล้วลองใหม่");
  if (verification.status !== "authenticated") return failure("รหัสผ่าน admin ไม่ถูกต้อง ยังไม่ได้ลบผู้ใช้");
  if (!await getAdminByName(admin.name)) return failure("บัญชีนี้ไม่มีสิทธิ์ admin แล้ว");
  const database = await getMongoDatabase();
  const result = await database.collection("user").deleteOne(targetFilter(target));
  if (!result.deletedCount) return failure("ข้อมูลผู้ใช้เปลี่ยนไปแล้ว กรุณาโหลดรายการใหม่");
  return { status: "success", message: `ลบผู้ใช้ ${target.name} แล้ว` };
}
