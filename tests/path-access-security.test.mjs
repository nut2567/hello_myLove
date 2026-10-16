import { afterAll, beforeEach, expect, mock, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { CredentialsSignin } from "@auth/core/errors";
import ts from "typescript";
import {
  hashPathPin, isPathPinHash, normalizePathPin, verifyPathPin,
} from "../src/lib/path-password.ts";
import { migratePathPins } from "../src/lib/path-pin-migration.ts";
import {
  getPathAccessClientIp, PATH_ACCESS_ATTEMPTS_COLLECTION, PATH_ACCESS_IP_LIMIT,
  PATH_ACCESS_PATH_LIMIT, reservePathAccessAttempt,
} from "../src/lib/path-access-throttle.ts";

// Run against real MongoDB operations, but only in namespaced disposable development collections.
if (process.env.DATABASE_NAME !== "development") {
  throw new Error("Authentication integration tests require DATABASE_NAME=development.");
}
const realGetMongoClient = (await import("../src/lib/mongodb.ts")).getMongoClient;
const liveClient = await realGetMongoClient();
const liveDb = liveClient.db("development");
const prefix = `codex_auth_test_${randomUUID().replaceAll("-", "")}_`;
const collectionNames = new Set();
const isolatedDb = {
  collection(name) {
    const isolatedName = prefix + name;
    collectionNames.add(isolatedName);
    return liveDb.collection(isolatedName);
  },
};
const isolatedClient = { db: () => isolatedDb };
mock.module("../src/lib/mongodb.ts", () => ({
  getMongoClient: async () => isolatedClient,
  getMongoDatabase: async () => isolatedDb,
}));
const paths = await import("../src/lib/path-access.ts");

let session = null;
let signInCount = 0;
let authConfig;
const redirect = (url) => {
  const error = new Error("redirect");
  error.url = url;
  throw error;
};
mock.module("next-auth", () => ({
  CredentialsSignin,
  default: (config) => {
    authConfig = config;
    return {
      handlers: {},
      auth: async () => session,
      signOut: async () => { session = null; },
      signIn: async (provider, options) => {
        expect(provider).toBe("path-access");
        const authorize = config.providers.find(item => item.options.id === provider).options.authorize;
        const user = await authorize(options, new Request("http://localhost/api/auth/callback/path-access", {
          headers: { "x-forwarded-for": "192.0.2.10" },
        }));
        if (!user) throw new CredentialsSignin();
        signInCount += 1;
        const token = config.callbacks.jwt({ token: {}, user });
        session = await config.callbacks.session({ session: { user: {} }, token });
        redirect(options.redirectTo);
      },
    };
  },
}));
// CAPTCHA boundary failures are tested separately; these DB fixtures use a verified token.
mock.module("../src/lib/recaptcha.ts", () => ({
  verifyRecaptcha: async token => token === "fixture-captcha",
  getRecaptchaSiteKey: () => "fixture-site-key",
}));
const authentication = await import("../src/auth.ts");
const pathSessions = await import("../src/lib/path-session.ts");
const adminUsers = await import("../src/lib/admin-users.ts");
const revalidatedPaths = [];
mock.module("next/cache", () => ({ revalidatePath: path => revalidatedPaths.push(path) }));
mock.module("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "192.0.2.10" }) }));
const adminActions = await import("../src/app/(site)/admin/actions.ts");

// Capture the inline Server Action from the real route without exporting it in production.
const formComponent = () => {};
const jsx = (type, props) => ({ type, props });
const routeDependencies = {
  "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
  "next/navigation": { redirect, notFound: () => { throw new Error("not-found"); } },
  "next-auth": { CredentialsSignin },
  "next/link": "link",
  "@/auth": authentication,
  "@/lib/path-access": paths,
  "@/lib/path-password": { normalizePathPin },
  "@/lib/path-session": pathSessions,
  "@/components/home/home-slide-wrapper": { HomeSlideWrapper: "home" },
  "@/components/path-access-form": { PathAccessForm: formComponent },
  "@/components/welcome-pixel-modal": { WelcomePixelModal: "welcome" },
  "@/components/ui/button-link": { ButtonLink: "button-link" },
  "@/components/translated-text": { TranslatedText: "translated-text" },
};
const source = readFileSync(new URL("../src/app/(site)/[[...slug]]/page.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const route = {};
runInNewContext(compiled + "\nexports.unlock = unlockSubmittedPath;", {
  exports: route, console, require: (name) => {
    if (!(name in routeDependencies)) throw new Error(`Unexpected route dependency: ${name}`);
    return routeDependencies[name];
  },
});

async function unlock(name, pin) {
  const form = new FormData();
  form.set("path", name);
  if (pin !== undefined) form.set("pin", pin);
  try { await route.unlock(form); } catch (error) {
    if (error.url) return error.url;
    throw error;
  }
}
const headers = new Headers({ "x-forwarded-for": "192.0.2.10" });
const reserve = (name, ip = "192.0.2.10") => reservePathAccessAttempt({
  client: isolatedClient, databaseName: "development", name,
  headers: new Headers({ "x-forwarded-for": ip }),
});
async function seedUser(name = "alpha", pin = "fixture-password") {
  await isolatedDb.collection("user").insertOne({
    name, pinHash: await hashPathPin(pin), type: `${name}-room`, music: [],
  });
}

beforeEach(async () => {
  for (const name of collectionNames) await liveDb.collection(name).deleteMany({});
  session = null;
  signInCount = 0;
});
afterAll(async () => {
  try {
    for (const name of collectionNames) {
      if (!name.startsWith(prefix)) throw new Error("Invalid test cleanup namespace.");
      try { await liveDb.collection(name).drop(); } catch (error) {
        if (error.code !== 26) throw error;
      }
    }
  } finally { await liveClient.close(); }
});

test("Argon2id uses independent salts and verifies Unicode without revealing plaintext", async () => {
  const pin = "รหัส-fixture-🔐";
  const first = await hashPathPin(pin);
  const second = await hashPathPin(pin);
  expect(first).not.toBe(second);
  expect(first).toStartWith("$argon2id$v=19$m=19456,t=2,p=1$");
  expect(first).not.toContain(pin);
  expect(await verifyPathPin(first, pin)).toBe(true);
  expect(await verifyPathPin(first, "wrong-password")).toBe(false);
});

test("invalid hashes and oversized or non-string submitted passwords fail closed", async () => {
  expect(isPathPinHash("$argon2id$invalid")).toBe(false);
  expect(await verifyPathPin("malformed", "fixture")).toBe(false);
  expect(normalizePathPin({ pin: "fixture" })).toBeNull();
  expect(normalizePathPin(" ")).toBeNull();
  expect(normalizePathPin("x".repeat(1025))).toBeNull();
  expect(normalizePathPin("  fixture  ")).toBe("fixture");
});

test("hashed login returns only public fields and rejects an incorrect password", async () => {
  await seedUser();
  const user = await paths.getPathUserByCredentials({ name: "alpha", pin: "fixture-password" });
  expect(user).toEqual({ name: "alpha", type: "alpha-room", music: [] });
  expect(await paths.getPathUserByCredentials({ name: "alpha", pin: "incorrect" })).toBeNull();
});

test("a successful legacy login upgrades atomically; a failed one does not change the credential", async () => {
  const users = isolatedDb.collection("user");
  await users.insertOne({ name: "alpha", pin: "fixture-password", music: [] });
  expect(await paths.getPathUserByCredentials({ name: "alpha", pin: "wrong" })).toBeNull();
  expect((await users.findOne({ name: "alpha" })).pin).toBe("fixture-password");
  expect(await paths.getPathUserByCredentials({ name: "alpha", pin: "fixture-password" })).not.toBeNull();
  const stored = await users.findOne({ name: "alpha" });
  expect(stored.pin).toBeUndefined();
  expect(await verifyPathPin(stored.pinHash, "fixture-password")).toBe(true);
});

test("an existing hash takes precedence over a leftover legacy pin", async () => {
  await seedUser();
  await isolatedDb.collection("user").updateOne({ name: "alpha" }, { $set: { pin: "old-password" } });
  expect(await paths.getPathUserByCredentials({ name: "alpha", pin: "old-password" })).toBeNull();
});

test("repeating a pending request does not count a random salt as a password change", async () => {
  await paths.upsertNewPathRequest({ name: "pending", pin: "fixture-password" });
  const initial = await isolatedDb.collection("newUser").findOne({ path: "pending" });
  await paths.upsertNewPathRequest({ name: "pending", pin: "fixture-password" });
  const repeated = await isolatedDb.collection("newUser").findOne({ path: "pending" });
  expect(repeated.pin).toBeUndefined();
  expect(repeated.pinHash).toBe(initial.pinHash);
  expect(repeated.pinChangeCount).toBe(0);
  await paths.upsertNewPathRequest({ name: "pending", pin: "changed-password" });
  const changed = await isolatedDb.collection("newUser").findOne({ path: "pending" });
  expect(changed.pinChangeCount).toBe(1);
  expect(changed.createdAt).toBe(initial.createdAt);
  expect(await verifyPathPin(changed.pinHash, "changed-password")).toBe(true);
});

test("concurrent pending requests do not duplicate records or inflate password-change counts", async () => {
  await Promise.all(Array.from({ length: 6 }, () => paths.upsertNewPathRequest({ name: "pending", pin: "fixture-password" })));
  expect(await isolatedDb.collection("newUser").countDocuments({ path: "pending" })).toBe(1);
  expect((await isolatedDb.collection("newUser").findOne({ path: "pending" })).pinChangeCount).toBe(0);
}, 30_000);

test("access logs retain counters and timestamps while removing old wrong-password contents", async () => {
  await isolatedDb.collection("logOnUser").insertOne({ _id: "alpha", wrongpass: ["old-fixture-secret"] });
  await paths.logExistingPathUserAccess({ name: "alpha", passwordCorrect: false });
  await paths.logExistingPathUserAccess({ name: "alpha", passwordCorrect: true });
  const log = await isolatedDb.collection("logOnUser").findOne({ _id: "alpha" });
  expect(log.wrongpass).toBeUndefined();
  expect(log.visitCount).toBe(2);
  expect(log.successCount).toBe(1);
  expect(log.wrongPasswordCount).toBe(1);
  expect(typeof log.latestVisitedAtThai).toBe("string");
});

test("account throttling cannot be bypassed by rotating IPs", async () => {
  for (let attempt = 0; attempt < PATH_ACCESS_PATH_LIMIT; attempt += 1) {
    expect(await reserve("alpha", `192.0.2.${attempt + 1}`)).toBe(true);
  }
  expect(await reserve("alpha", "198.51.100.1")).toBe(false);
}, 30_000);

test("IP throttling cannot be bypassed by rotating paths", async () => {
  for (let attempt = 0; attempt < PATH_ACCESS_IP_LIMIT; attempt += 1) {
    expect(await reserve(`path-${attempt}`)).toBe(true);
  }
  expect(await reserve("another-path")).toBe(false);
}, 60_000);

function mutationForm(target, overrides = {}) {
  const form = managedUserForm(target.name, { pin: "", confirmPin: "", ...overrides });
  form.set("originalName", target.name);
  form.set("userId", String(target._id));
  form.set("revisionId", target.revisionId ?? "");
  form.set("confirmName", target.name);
  form.set("adminPin", "admin-fixture-password");
  return form;
}

test("admin dashboard returns all users beyond 50, correct totals and no credential fields", async () => {
  await seedAdmin();
  await isolatedDb.collection("user").insertMany(Array.from({length: 61}, (_, index) => ({
    name: `person-${index}`, type: "Group", role: "user", pin: "must-not-leak", pinHash: "must-not-leak-hash",
    music: [{url:"https://example.com/song",rate:5}],
  })));
  await isolatedDb.collection("logOnUser").insertMany([{successCount:3}, {successCount:7}]);
  const list = await adminUsers.listManagedUsers("admin");
  expect(list.total).toBe(62);
  expect(list.users).toHaveLength(62);
  expect(list.summary).toEqual({total:62, admins:1, links:61, successfulLogins:10});
  expect(JSON.stringify(list)).not.toContain("must-not-leak");
  let denied;
  try { await adminUsers.listManagedUsers("person-0"); } catch (error) { denied = error; }
  expect(denied?.message).toBe("Admin access required.");
}, 30_000);

test("admin edit/delete actions reject anonymous, ordinary and revoked admin accounts", async () => {
  await seedAdmin(); await seedUser("victim");
  const target = await isolatedDb.collection("user").findOne({name:"victim"});
  const form = mutationForm(target);
  for (const pathName of [undefined, "victim"]) {
    session = pathName ? {user:{pathName}} : null;
    expect((await adminActions.updateUser({}, form)).status).toBe("error");
    expect((await adminActions.deleteUser({}, form)).status).toBe("error");
  }
  await isolatedDb.collection("user").updateOne({name:"admin"}, {$unset:{role:""}});
  session = {user:{pathName:"admin",adminCaptchaVerified:true}};
  expect((await adminActions.updateUser({}, form)).status).toBe("error");
  expect((await adminActions.deleteUser({}, form)).status).toBe("error");
  expect(await isolatedDb.collection("user").findOne({name:"victim"})).not.toBeNull();
});

test("admin editing preserves a blank password, renames safely and rejects duplicate/reserved names", async () => {
  await seedAdmin(); await seedUser("original"); await seedUser("taken");
  session = {user:{pathName:"admin",adminCaptchaVerified:true}};
  const target = await isolatedDb.collection("user").findOne({name:"original"});
  const originalHash = target.pinHash;
  for(const name of ["taken", "th"]) {
    expect((await adminActions.updateUser({}, mutationForm(target, {name}))).status).toBe("error");
  }
  const form = mutationForm(target, {name:"renamed",type:"Updated",role:"admin"});
  form.append("musicUrl", "https://example.com/updated"); form.append("musicRate","9");
  expect((await adminActions.updateUser({}, form)).status).toBe("success");
  const updated = await isolatedDb.collection("user").findOne({name:"renamed"});
  expect(updated.pinHash).toBe(originalHash);
  expect(updated.role).not.toBe("admin");
  expect(updated.music).toEqual([{url:"https://example.com/updated",rate:9}]);
  expect(updated.updatedBy).toBe("admin");
  expect(await isolatedDb.collection("user").findOne({name:"original"})).toBeNull();
  expect((await adminActions.updateUser({}, form)).status).toBe("error");
});

test("admin password resets revoke old tokens and require the new password on the same path", async () => {
  await seedAdmin(); await seedUser("victim");
  const identity = await paths.getPathCredentialIdentity({name:"victim",pin:"fixture-password"});
  const oldSession = {user:{pathName:"victim",pathSessionId:identity.sessionId}};
  expect(await pathSessions.isPathSessionCurrent(oldSession,"victim")).toBe(true);
  session = {user:{pathName:"admin",adminCaptchaVerified:true}};
  const target = await isolatedDb.collection("user").findOne({name:"victim"});
  const form = mutationForm(target,{pin:"new-fixture-password",confirmPin:"new-fixture-password"});
  expect((await adminActions.updateUser({},form)).status).toBe("success");
  expect(await pathSessions.isPathSessionCurrent(oldSession,"victim")).toBe(false);
  expect(await pathSessions.isPathSessionCurrent({user:{pathName:"victim"}},"victim")).toBe(false);
  const refreshed = await authConfig.callbacks.session({session:{user:{}},token:{pathName:"victim",pathSessionId:identity.sessionId}});
  expect(refreshed.user).toBeUndefined();
  session = oldSession;
  expect(await unlock("victim","fixture-password")).toBe("/victim?password=invalid");
  expect(await unlock("victim","new-fixture-password")).toBe("/victim");
  expect(session.user.pathSessionId).not.toBe(identity.sessionId);
});

test("admin deletion requires the exact name and a fresh correct admin password each time", async () => {
  await seedAdmin(); await seedUser("victim"); await seedUser("second-victim");
  session = {user:{pathName:"admin",adminCaptchaVerified:true}};
  const target = await isolatedDb.collection("user").findOne({name:"victim"});
  for(const [key,value] of [["confirmName","VICTIM"],["confirmName","victim "],["adminPin",""],["adminPin","wrong-password"]]) {
    const form = mutationForm(target); form.set(key,value);
    expect((await adminActions.deleteUser({},form)).status).toBe("error");
    expect(await isolatedDb.collection("user").findOne({name:"victim"})).not.toBeNull();
  }
  expect((await adminActions.deleteUser({},mutationForm(target))).status).toBe("success");
  expect(await isolatedDb.collection("user").findOne({name:"victim"})).toBeNull();
  const second = await isolatedDb.collection("user").findOne({name:"second-victim"});
  const nextForm = mutationForm(second); nextForm.delete("adminPin");
  expect((await adminActions.deleteUser({},nextForm)).status).toBe("error");
  expect(await isolatedDb.collection("user").findOne({name:"second-victim"})).not.toBeNull();
  const adminLog = await isolatedDb.collection("logOnUser").findOne({path:"admin"});
  expect(adminLog).toBeNull();
},30_000);

test("admin records and changed/recreated targets are protected against stale edit/delete forms", async () => {
  await seedAdmin(); await seedUser("victim");
  session = {user:{pathName:"admin",adminCaptchaVerified:true}};
  const administrator = await isolatedDb.collection("user").findOne({name:"admin"});
  expect((await adminActions.updateUser({},mutationForm(administrator))).status).toBe("error");
  expect((await adminActions.deleteUser({},mutationForm(administrator))).status).toBe("error");
  const target = await isolatedDb.collection("user").findOne({name:"victim"});
  const stale = mutationForm(target);
  expect((await adminActions.updateUser({},mutationForm(target))).status).toBe("success");
  expect((await adminActions.deleteUser({},stale)).status).toBe("error");
  expect((await adminActions.updateUser({},stale)).status).toBe("error");
  await isolatedDb.collection("user").deleteOne({_id:target._id});
  await seedUser("victim");
  expect((await adminActions.deleteUser({},stale)).status).toBe("error");
  expect(await isolatedDb.collection("user").findOne({name:"victim"})).not.toBeNull();
});

test("admin deletion throttles repeated password guesses including direct action calls", async () => {
  await seedAdmin(); await seedUser("victim");
  session = {user:{pathName:"admin",adminCaptchaVerified:true}};
  const target = await isolatedDb.collection("user").findOne({name:"victim"});
  const incorrect = mutationForm(target); incorrect.set("adminPin","wrong-password");
  for(let index=0;index<PATH_ACCESS_PATH_LIMIT;index++) expect((await adminActions.deleteUser({},incorrect)).status).toBe("error");
  const limited = await adminActions.deleteUser({},mutationForm(target));
  expect(limited.message).toContain("15 นาที");
  expect(await isolatedDb.collection("user").findOne({name:"victim"})).not.toBeNull();
},60_000);

test("recreating a deleted user's name does not restore access to old sessions", async () => {
  await seedAdmin();
  expect((await adminUsers.createManagedUser("admin",managedUserForm("victim"))).status).toBe("success");
  const identity = await paths.getPathCredentialIdentity({name:"victim",pin:"new-user-password"});
  const tokenSession = {user:{pathName:"victim",pathSessionId:identity.sessionId}};
  const target = await isolatedDb.collection("user").findOne({name:"victim"});
  session = {user:{pathName:"admin",adminCaptchaVerified:true}};
  expect((await adminActions.deleteUser({},mutationForm(target))).status).toBe("success");
  expect(await pathSessions.isPathSessionCurrent(tokenSession,"victim")).toBe(false);
  expect((await adminUsers.createManagedUser("admin",managedUserForm("victim"))).status).toBe("success");
  expect(await pathSessions.isPathSessionCurrent(tokenSession,"victim")).toBe(false);
  expect(await pathSessions.isPathSessionCurrent({user:{pathName:"victim"}},"victim")).toBe(false);
});

test("renaming and restoring a user name does not reactivate old sessions", async () => {
  await seedAdmin(); await seedUser("original");
  session = {user:{pathName:"admin",adminCaptchaVerified:true}};
  const identity = await paths.getPathCredentialIdentity({name:"original",pin:"fixture-password"});
  const oldSession = {user:{pathName:"original",pathSessionId:identity.sessionId}};
  let target = await isolatedDb.collection("user").findOne({name:"original"});
  expect((await adminActions.updateUser({},mutationForm(target,{name:"renamed"}))).status).toBe("success");
  expect(await pathSessions.isPathSessionCurrent(oldSession,"original")).toBe(false);
  target = await isolatedDb.collection("user").findOne({name:"renamed"});
  expect((await adminActions.updateUser({},mutationForm(target,{name:"original"}))).status).toBe("success");
  expect(await pathSessions.isPathSessionCurrent(oldSession,"original")).toBe(false);
  expect(await paths.getPathUserByCredentials({name:"original",pin:"fixture-password"})).not.toBeNull();
});

test("parallel attempts respect the same atomic account limit", async () => {
  const results = await Promise.all(Array.from({ length: 20 }, () => reserve("alpha")));
  expect(results.filter(Boolean)).toHaveLength(PATH_ACCESS_PATH_LIMIT);
  const indexes = await isolatedDb.collection(PATH_ACCESS_ATTEMPTS_COLLECTION).indexes();
  expect(indexes.some(index => index.key.expiresAt === 1 && index.expireAfterSeconds === 0)).toBe(true);
}, 30_000);

test("expired throttling windows reset without waiting for background TTL deletion", async () => {
  for (let attempt = 0; attempt < PATH_ACCESS_PATH_LIMIT; attempt += 1) await reserve("alpha");
  expect(await reserve("alpha")).toBe(false);
  await isolatedDb.collection(PATH_ACCESS_ATTEMPTS_COLLECTION).updateMany({}, { $set: { windowEndsAtMs: 0 } });
  expect(await reserve("alpha")).toBe(true);
}, 30_000);

test("IP extraction rejects malformed headers and never stores a raw IP", async () => {
  expect(getPathAccessClientIp(new Headers({ "x-forwarded-for": "malformed" }))).toBe("unknown");
  await reserve("alpha");
  const documents = await isolatedDb.collection(PATH_ACCESS_ATTEMPTS_COLLECTION).find({}).toArray();
  expect(documents.every(document => !JSON.stringify(document).includes("192.0.2.10"))).toBe(true);
});

test("missing paths only save password hashes and are throttled too", async () => {
  expect((await paths.authenticatePathUser({ name: "pending", pin: "fixture-password", headers })).status).toBe("request-pending");
  const request = await isolatedDb.collection("newUser").findOne({ path: "pending" });
  expect(request.pin).toBeUndefined();
  expect(await verifyPathPin(request.pinHash, "fixture-password")).toBe(true);
});

test("migration preserves passwords and metadata, removes sensitive logs, and is idempotent", async () => {
  await isolatedDb.collection("user").insertOne({ name: "alpha", pin: "fixture-password", type: "room", music: [] });
  await isolatedDb.collection("newUser").insertOne({ path: "pending", pin: "pending-password", pinChangeCount: 4 });
  await isolatedDb.collection("logOnUser").insertOne({ _id: "alpha", successCount: 8, wrongpass: ["old-fixture-secret"] });
  expect((await migratePathPins(isolatedDb)).plaintextCredentials).toBe(2);
  expect((await isolatedDb.collection("user").findOne({ name: "alpha" })).pin).toBe("fixture-password");
  const applied = await migratePathPins(isolatedDb, true);
  expect(applied.migratedCredentials).toBe(2);
  expect(applied.removedPasswordLogs).toBe(1);
  const user = await isolatedDb.collection("user").findOne({ name: "alpha" });
  expect(user.pin).toBeUndefined();
  expect(user.type).toBe("room");
  expect(await verifyPathPin(user.pinHash, "fixture-password")).toBe(true);
  expect((await isolatedDb.collection("newUser").findOne({ path: "pending" })).pinChangeCount).toBe(4);
  expect((await isolatedDb.collection("logOnUser").findOne({ _id: "alpha" })).successCount).toBe(8);
  expect((await migratePathPins(isolatedDb, true)).migratedCredentials).toBe(0);
});

test("migration refuses malformed credentials before changing other records", async () => {
  await isolatedDb.collection("user").insertMany([
    { name: "alpha", pin: "fixture-password" },
    { name: "invalid", pin: "fixture-password", pinHash: "malformed" },
  ]);
  let rejection;
  try { await migratePathPins(isolatedDb, true); } catch (error) { rejection = error; }
  expect(rejection?.message).toContain("Migration stopped:");
  expect((await isolatedDb.collection("user").findOne({ name: "alpha" })).pin).toBe("fixture-password");
});

test("same-path Server Action reuses the session without login, throttle reservations, or log writes", async () => {
  await seedUser("alpha");
  session = { user: { pathName: "alpha", pathType: "room" } };
  expect(await unlock("/ALPHA")).toBe("/alpha");
  expect(signInCount).toBe(0);
  expect(await isolatedDb.collection(PATH_ACCESS_ATTEMPTS_COLLECTION).countDocuments({})).toBe(0);
  expect(await isolatedDb.collection("logOnUser").countDocuments({})).toBe(0);
});

test("wrong or missing new paths keep the previous session; successful login replaces it", async () => {
  await seedUser("beta");
  session = { user: { pathName: "alpha", pathType: "old-room" } };
  expect(await unlock("beta", "wrong-password")).toBe("/beta?password=invalid");
  expect(session.user.pathName).toBe("alpha");
  expect(await unlock("pending", "fixture-password")).toBe("/pending?request=notfound");
  expect(session.user.pathName).toBe("alpha");
  expect(await unlock("beta", "fixture-password")).toBe("/beta");
  expect(session.user.pathName).toBe("beta");
  expect(signInCount).toBe(1);
  expect((await isolatedDb.collection("logOnUser").findOne({ _id: "beta" })).visitCount).toBe(2);
});

test("the NextAuth provider itself enforces throttling, including direct auth API attempts", async () => {
  await seedUser();
  const authorize = authConfig.providers.find(item => item.options.id === "path-access").options.authorize;
  const request = new Request("http://localhost/api/auth/callback/path-access", { headers });
  for (let attempt = 0; attempt < PATH_ACCESS_PATH_LIMIT; attempt += 1) {
    expect(await authorize({ path: "alpha", pin: "wrong-password" }, request)).toBeNull();
  }
  let rejection;
  try { await authorize({ path: "alpha", pin: "fixture-password" }, request); } catch (error) { rejection = error; }
  expect(rejection?.code).toBe("rate-limited");
  session = { user: { pathName: "beta" } };
  expect(await unlock("alpha", "fixture-password")).toBe("/alpha?password=limited");
  expect(session.user.pathName).toBe("beta");
}, 60_000);

function managedUserForm(name = "new-person", overrides = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ name, pin: "new-user-password", confirmPin: "new-user-password", type: "Personal", ...overrides })) form.set(key, value);
  return form;
}

async function seedAdmin() {
  await seedUser("admin", "admin-fixture-password");
  await isolatedDb.collection("user").updateOne({ name: "admin" }, { $set: { role: "admin" } });
}

test("admin creation action denies anonymous and normal users, including forged role input", async () => {
  await seedUser();
  const form = managedUserForm("forbidden", { role: "admin" });
  expect((await adminActions.createUser({}, form)).status).toBe("error");
  session = { user: { pathName: "alpha", role: "admin", pathType: "Administrator", adminCaptchaVerified: true } };
  expect((await adminActions.createUser({}, form)).status).toBe("error");
  expect(await isolatedDb.collection("user").findOne({ name: "forbidden" })).toBeNull();
});

test("admin creates a normal user with hashed password and valid optional music, without exposing credentials", async () => {
  await seedAdmin();
  session = { user: { pathName: "admin", adminCaptchaVerified: true } };
  const form = managedUserForm("New-Person", { role: "admin" });
  form.append("musicUrl", "https://example.com/music"); form.append("musicRate", "8.5");
  form.append("musicUrl", "https://example.com/video"); form.append("musicRate", "");
  const result = await adminActions.createUser({}, form);
  expect(result.status).toBe("success");
  const document = await isolatedDb.collection("user").findOne({ name: "new-person" });
  expect(document.role).toBe("user");
  expect(document.pin).toBeUndefined();
  expect(document.confirmPin).toBeUndefined();
  expect(await verifyPathPin(document.pinHash, "new-user-password")).toBe(true);
  expect(document.music).toEqual([{ url: "https://example.com/music", rate: 8.5 }, { url: "https://example.com/video", rate: null }]);
  expect(JSON.stringify(result)).not.toContain("new-user-password");
  expect(revalidatedPaths).toContain("/admin");
  const list = await adminUsers.listManagedUsers("admin");
  expect(list.users.map(user => ({ name: user.name, type: user.type }))).toEqual([{ name: "admin", type: "admin-room" }, { name: "new-person", type: "Personal" }]);
  expect(JSON.stringify(list)).not.toContain("pinHash");
  expect(await paths.getPathUserByCredentials({ name: "new-person", pin: "new-user-password" })).not.toBeNull();
});

test("admin validates reserved paths, password confirmation and length, URLs and music scores", async () => {
  await seedAdmin();
  for (const name of ["admin", "api", "th", "_next", "two/segments", "ชื่อไทย"]) {
    expect((await adminUsers.createManagedUser("admin", managedUserForm(name))).status).toBe("error");
  }
  for (const overrides of [{ confirmPin: "different-password" }, { pin: "short", confirmPin: "short" }, { pin: "x".repeat(1025) }, { type: "x".repeat(101) }]) {
    expect((await adminUsers.createManagedUser("admin", managedUserForm("bad", overrides))).status).toBe("error");
  }
  for (const [url, rate] of [["javascript:alert(1)", ""], ["https://name:secret@example.com", ""], ["https://example.com", "11"], ["https://example.com", "NaN"], ["", "5"]]) {
    const form = managedUserForm("bad"); form.append("musicUrl", url); form.append("musicRate", rate);
    expect((await adminUsers.createManagedUser("admin", form)).status).toBe("error");
  }
  expect(await isolatedDb.collection("user").findOne({ name: "bad" })).toBeNull();
});

test("admin creation refuses an existing user and concurrent duplicates without replacing a password", async () => {
  await seedAdmin(); await seedUser("existing");
  const original = await isolatedDb.collection("user").findOne({ name: "existing" });
  expect((await adminUsers.createManagedUser("admin", managedUserForm("existing"))).status).toBe("error");
  expect((await isolatedDb.collection("user").findOne({ name: "existing" })).pinHash).toBe(original.pinHash);
  const results = await Promise.all([1, 2].map(() => adminUsers.createManagedUser("admin", managedUserForm("simultaneous"))));
  expect(results.filter(result => result.status === "success")).toHaveLength(1);
  expect(results.filter(result => result.status === "error")).toHaveLength(1);
  expect(await isolatedDb.collection("user").countDocuments({ name: "simultaneous" })).toBe(1);
}, 30_000);

test("revoked admin role blocks creation even with an existing admin session", async () => {
  await seedAdmin(); session = { user: { pathName: "admin", adminCaptchaVerified: true } };
  expect(await adminUsers.getAdminByName("admin")).not.toBeNull();
  await isolatedDb.collection("user").updateOne({ name: "admin" }, { $unset: { role: "" } });
  expect(await adminUsers.getAdminByName("admin")).toBeNull();
  expect((await adminActions.createUser({}, managedUserForm("after-revocation"))).status).toBe("error");
  expect(await isolatedDb.collection("user").findOne({ name: "after-revocation" })).toBeNull();
});

test("admin provider rejects normal/unknown accounts and throttles direct API attempts", async () => {
  await seedAdmin(); await seedUser();
  const providerAuthorize = authConfig.providers.find(item => item.options.id === "admin-access").options.authorize;
  const authorize = (credentials, request) => providerAuthorize({ ...credentials, recaptchaToken: "fixture-captcha" }, request);
  const request = new Request("http://localhost/api/auth/callback/admin-access", { headers });
  expect(await authorize({ path: "alpha", pin: "fixture-password" }, request)).toBeNull();
  expect(await authorize({ path: "unknown-admin", pin: "fixture-password" }, request)).toBeNull();
  expect(await isolatedDb.collection("newUser").countDocuments({})).toBe(0);
  expect((await authorize({ path: "admin", pin: "admin-fixture-password" }, request)).pathName).toBe("admin");
  for (let attempt = 1; attempt < PATH_ACCESS_PATH_LIMIT; attempt += 1) {
    expect(await authorize({ path: "admin", pin: "wrong-password" }, request)).toBeNull();
  }
  let rejection;
  try { await authorize({ path: "admin", pin: "admin-fixture-password" }, request); } catch (error) { rejection = error; }
  expect(rejection?.code).toBe("rate-limited");
}, 60_000);
