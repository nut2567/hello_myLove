import { afterAll, beforeEach, expect, mock, test } from "bun:test";
import { CredentialsSignin } from "@auth/core/errors";

const originalFetch = globalThis.fetch;
const originalSiteKey = process.env.RECAPTCHA_SITE_KEY;
const originalSecret = process.env.RECAPTCHA_SECRET_KEY;
const jar = new Map();
let cookieOptions;
let config;
let session;
let adminChecks;
let writes;
const player = { id: "83b8c77f-cae4-4ea2-8974-e8c7fe5a0cd9", name: "Guest", type: "guest" };

mock.module("next/headers", () => ({
  cookies: async () => ({
    get: name => jar.has(name) ? { value: jar.get(name) } : undefined,
    set: (name, value, options) => { jar.set(name, value); cookieOptions = options; },
  }),
  headers: async () => new Headers(),
}));
mock.module("next/cache", () => ({ revalidatePath: () => {} }));
mock.module("next-auth", () => ({
  CredentialsSignin,
  default: value => {
    config = value;
    return { auth: async () => session, handlers: {}, signIn: async () => {}, signOut: async () => {} };
  },
}));
mock.module("../src/lib/path-access.ts", () => ({
  normalizePathNameValue: value => typeof value === "string" ? value : null,
  authenticatePathUser: async () => ({ status: "authenticated", user: { name: "admin" }, sessionId: "fixture-session" }),
}));
mock.module("../src/lib/path-password.ts", () => ({ normalizePathPin: value => typeof value === "string" ? value : null }));
mock.module("../src/lib/path-session.ts", () => ({ isPathSessionCurrent: async () => true }));
mock.module("../src/lib/admin-users.ts", () => ({
  authenticateAdminUser: async () => {
    adminChecks++;
    return { status: "authenticated", user: { name: "admin" }, sessionId: "fixture-session" };
  },
  createManagedUser: async () => { writes++; return { status: "success" }; },
  updateManagedUser: async () => { writes++; return { status: "success" }; },
  deleteManagedUser: async () => { writes++; return { status: "success" }; },
}));
mock.module("../src/lib/mongodb.ts", () => ({
  getMongoDatabase: async () => ({ collection: () => ({ insertOne: async () => { writes++; } }) }),
}));

const captcha = await import("../src/lib/recaptcha.ts");
const passes = await import("../src/lib/heart-game-access.ts");
const hearts = await import("../src/app/(site)/th/heart/actions.ts");
const admins = await import("../src/app/(site)/admin/actions.ts");

beforeEach(() => {
  process.env.RECAPTCHA_SITE_KEY = "fixture-site";
  process.env.RECAPTCHA_SECRET_KEY = "fixture-secret";
  jar.clear();
  session = null;
  adminChecks = 0;
  writes = 0;
  globalThis.fetch = mock(async () => Response.json({ success: true }));
});

afterAll(() => {
  globalThis.fetch = originalFetch;
  if (originalSiteKey === undefined) delete process.env.RECAPTCHA_SITE_KEY;
  else process.env.RECAPTCHA_SITE_KEY = originalSiteKey;
  if (originalSecret === undefined) delete process.env.RECAPTCHA_SECRET_KEY;
  else process.env.RECAPTCHA_SECRET_KEY = originalSecret;
});

test("missing configuration and empty or oversized tokens fail without calling Google", async () => {
  for (const token of [undefined, null, "", " ", 123, "x".repeat(4097)]) {
    expect(await captcha.verifyRecaptcha(token)).toBe(false);
  }
  delete process.env.RECAPTCHA_SECRET_KEY;
  expect(await captcha.verifyRecaptcha("token")).toBe(false);
  process.env.RECAPTCHA_SECRET_KEY = "fixture-secret";
  delete process.env.RECAPTCHA_SITE_KEY;
  expect(await captcha.verifyRecaptcha("token")).toBe(false);
  expect(fetch).not.toHaveBeenCalled();
});

test("verification posts the token to Google with a timeout and no cache", async () => {
  expect(await captcha.verifyRecaptcha("fixture-token")).toBe(true);
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe("https://www.google.com/recaptcha/api/siteverify");
  expect(options.method).toBe("POST");
  expect(options.body.get("secret")).toBe("fixture-secret");
  expect(options.body.get("response")).toBe("fixture-token");
  expect(options.cache).toBe("no-store");
  expect(options.signal).toBeInstanceOf(AbortSignal);
});

test("Google rejection, replay, quota errors, bad responses and network failure deny access", async () => {
  for (const body of [null, {}, { success: "true" }, { success: false, "error-codes": ["timeout-or-duplicate"] },
    { success: true, "error-codes": ["Over free quota."] }]) {
    globalThis.fetch = async () => Response.json(body);
    expect(await hearts.verifyHeartGameAccess("token")).toEqual({ ok: false });
    expect(jar.size).toBe(0);
  }
  for (const response of [new Response("invalid json"), new Response("unavailable", { status: 503 })]) {
    globalThis.fetch = async () => response;
    expect(await captcha.verifyRecaptcha("token")).toBe(false);
  }
  globalThis.fetch = async () => { throw new Error("network unavailable"); };
  expect(await captcha.verifyRecaptcha("token")).toBe(false);
});

test("heart pass is signed, expires, rejects altered values and uses protected cookies", async () => {
  const result = await hearts.verifyHeartGameAccess("token");
  expect(result.ok).toBe(true);
  const value = jar.get("heart-game-captcha");
  expect(passes.readHeartGamePass(value)).toBe(result.expiresAt);
  expect(cookieOptions).toMatchObject({ httpOnly: true, sameSite: "strict", path: "/th/heart", maxAge: 7200 });
  for (const forged of [undefined, "", "true", value + ".extra", value.replace(/.$/, value.endsWith("0") ? "1" : "0"),
    `1000000000000.${value.split(".").slice(1).join(".")}`]) {
    expect(passes.readHeartGamePass(forged)).toBeNull();
  }
  const { getCurrentTimestamp } = await import("../src/lib/date-time.ts");
  const { createHmac } = await import("node:crypto");
  for (const expiry of [getCurrentTimestamp() - 1, getCurrentTimestamp() + 7201_000]) {
    const payload = `${expiry}.${"a".repeat(32)}`;
    const signature = createHmac("sha256", "fixture-secret").update(`heart-game-captcha:v1:${payload}`).digest("hex");
    expect(passes.readHeartGamePass(`${payload}.${signature}`)).toBeNull();
  }
  process.env.RECAPTCHA_SECRET_KEY = "rotated-secret";
  expect(passes.readHeartGamePass(value)).toBeNull();
});

test("guest, remembered player and authenticated score requests cannot bypass verification", async () => {
  expect(await hearts.createHeartGamePlayer({ type: "guest" })).toEqual({ ok: false, reason: "captcha-required" });
  for (const user of [null, { user: { pathName: "admin" } }]) {
    session = user;
    expect(await hearts.saveHeartGameScore({ currentHeartId: "123456", score: 10, player }))
      .toEqual({ ok: false, saved: false, reason: "captcha-required" });
  }
  expect(writes).toBe(0);
});

test("verified guests and authenticated players preserve player and score validation", async () => {
  await hearts.verifyHeartGameAccess("token");
  expect((await hearts.createHeartGamePlayer({ type: "guest" })).ok).toBe(true);
  expect((await hearts.createHeartGamePlayer({ type: "named", name: "Friend" })).ok).toBe(true);
  expect((await hearts.createHeartGamePlayer({ type: "named", name: "" })).reason).toBe("invalid-player-name");
  expect((await hearts.saveHeartGameScore({ currentHeartId: "123456", score: -1, player })).reason).toBe("invalid-score");
  expect((await hearts.saveHeartGameScore({ currentHeartId: "123456", score: 10, player })).saved).toBe(true);
  session = { user: { pathName: "admin" } };
  expect((await hearts.saveHeartGameScore({ currentHeartId: "123456", score: 10 })).saved).toBe(true);
  expect(writes).toBe(2);
});

test("direct admin credentials calls require Google verification before checking passwords", async () => {
  const authorize = config.providers.find(provider => provider.options.id === "admin-access").options.authorize;
  const request = new Request("http://localhost/api/auth/callback/admin-access");
  await expect(authorize({ path: "admin", pin: "password" }, request)).rejects.toMatchObject({ code: "captcha-required" });
  expect(adminChecks).toBe(0);
  globalThis.fetch = async () => Response.json({ success: false });
  await expect(authorize({ path: "admin", pin: "password", recaptchaToken: "forged" }, request)).rejects.toMatchObject({ code: "captcha-required" });
  expect(adminChecks).toBe(0);
  globalThis.fetch = async () => Response.json({ success: true });
  const user = await authorize({ path: "admin", pin: "password", recaptchaToken: "token" }, request);
  expect(user.adminCaptchaVerified).toBe(true);
  expect(adminChecks).toBe(1);
});

test("admin proof survives JWT sessions and is cleared by ordinary path sign-in", async () => {
  let token = config.callbacks.jwt({ token: {}, user: { pathName: "admin", adminCaptchaVerified: true } });
  expect((await config.callbacks.session({ token, session: { user: {} } })).user.adminCaptchaVerified).toBe(true);
  token = config.callbacks.jwt({ token, user: { pathName: "admin" } });
  expect((await config.callbacks.session({ token, session: { user: {} } })).user.adminCaptchaVerified).toBe(false);
  expect((await config.callbacks.session({ token: { pathName: "admin" }, session: { user: {} } })).user.adminCaptchaVerified).toBe(false);
});

test("all admin mutations deny old and path-only sessions before touching user data", async () => {
  for (const user of [null, { user: { pathName: "admin" } }, { user: { pathName: "admin", adminCaptchaVerified: false } }]) {
    session = user;
    for (const action of [admins.createUser, admins.updateUser, admins.deleteUser]) {
      expect((await action({}, new FormData())).status).toBe("error");
    }
  }
  expect(writes).toBe(0);
  session = { user: { pathName: "admin", adminCaptchaVerified: true } };
  expect((await admins.createUser({}, new FormData())).status).toBe("success");
});
