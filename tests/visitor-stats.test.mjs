import { afterAll, beforeEach, expect, mock, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";

// All writes, including transactions and history backfills, use disposable
// namespaced collections in development, never the site's real collections.
const database = await import("../src/lib/mongodb.ts");
const realClient = await database.getMongoClient();
const liveDb = realClient.db("development");
const prefix = `codex_visitor_test_${randomUUID().replaceAll("-", "")}_`;
const collectionNames = new Set();
const isolatedDb = {
  collection(name) {
    const isolatedName = prefix + name;
    collectionNames.add(isolatedName);
    return liveDb.collection(isolatedName);
  },
};
for (const name of ["visitor_events", "visitor_stats"]) {
  isolatedDb.collection(name);
  await liveDb.createCollection(prefix + name);
}
mock.module("../src/lib/mongodb.ts", () => ({
  getMongoClient: async () => realClient,
  getMongoDatabase: async () => isolatedDb,
}));
const time = await import("../src/lib/date-time.ts");
let now = new Date("2026-10-13T16:59:59Z"); // 23:59:59 in Bangkok.
mock.module("../src/lib/date-time.ts", () => ({ ...time, getCurrentDate: () => now }));
const { getVisitorStats } = await import("../src/lib/visitor-stats.ts");
const { saveVisitorEvent } = await import("../src/lib/visitor-tracking.ts");
const route = await import("../src/app/api/visitor/route.ts");
const { proxy } = await import("../src/proxy.ts");
const oldSecret = process.env.VISITOR_TRACKING_SECRET;
process.env.VISITOR_TRACKING_SECRET = "visitor-test-secret";

const payload = {
  pathname: "/", ip: "192.0.2.10", userAgent: "visitor-test",
  referer: null, country: null, city: null, region: null, latitude: null, longitude: null,
};

beforeEach(async () => {
  now = new Date("2026-10-13T16:59:59Z");
  for (const name of collectionNames) await liveDb.collection(name).deleteMany({});
});

afterAll(async () => {
  if (oldSecret === undefined) delete process.env.VISITOR_TRACKING_SECRET;
  else process.env.VISITOR_TRACKING_SECRET = oldSecret;
  for (const name of collectionNames) await liveDb.collection(name).drop();
  await realClient.close();
});

test("backfills all existing visits once and preserves their daily history", async () => {
  await isolatedDb.collection("visitor_events").insertMany([
    { createdAt: "2026-10-12 08:00:00" },
    { createdAt: "2026-10-13 09:00:00" },
    { createdAt: "2026-10-13 10:00:00" },
  ]);
  expect(await getVisitorStats()).toEqual({ total: 3, today: 2, date: "2026-10-13" });
  await saveVisitorEvent(payload);
  expect(await getVisitorStats()).toEqual({ total: 4, today: 3, date: "2026-10-13" });
  expect(await getVisitorStats()).toEqual({ total: 4, today: 3, date: "2026-10-13" });
  const stored = await isolatedDb.collection("visitor_stats").findOne({ _id: "site" });
  expect(stored.daily).toEqual({ "2026-10-12": 1, "2026-10-13": 3 });
  const event = await isolatedDb.collection("visitor_events").findOne({ pathname: "/" });
  expect(event.ipHash).toHaveLength(64);
  expect(event.ip).toBeUndefined();
});

test("resets today's displayed count at Thai midnight without losing past totals", async () => {
  await saveVisitorEvent(payload);
  now = new Date("2026-10-13T17:00:00Z");
  expect(await getVisitorStats()).toEqual({ total: 1, today: 0, date: "2026-10-14" });
  await saveVisitorEvent(payload);
  expect(await getVisitorStats()).toEqual({ total: 2, today: 1, date: "2026-10-14" });
  const stored = await isolatedDb.collection("visitor_stats").findOne({ _id: "site" });
  expect(stored.daily).toEqual({ "2026-10-13": 1, "2026-10-14": 1 });
});

test("concurrent first visits cannot overwrite totals or duplicate the historical backfill", async () => {
  await isolatedDb.collection("visitor_events").insertOne({ createdAt: "2026-10-12 08:00:00" });
  await Promise.all(Array.from({ length: 12 }, () => saveVisitorEvent(payload)));
  expect(await getVisitorStats()).toEqual({ total: 13, today: 12, date: "2026-10-13" });
  expect(await isolatedDb.collection("visitor_events").countDocuments()).toBe(13);
});

test("a failed counter write rolls back the event so counts and events stay consistent", async () => {
  await getVisitorStats();
  // Make MongoDB itself reject the increment, after the event has been inserted.
  await isolatedDb.collection("visitor_stats").updateOne(
    { _id: "site" }, { $set: { total: "invalid-test-counter" } },
  );
  await expect(saveVisitorEvent(payload)).rejects.toThrow();
  expect(await isolatedDb.collection("visitor_events").countDocuments()).toBe(0);
  const stored = await isolatedDb.collection("visitor_stats").findOne({ _id: "site" });
  expect(stored.total).toBe("invalid-test-counter");
});

test("public statistics are read-only and writes still require the tracking secret", async () => {
  const publicResponse = await route.GET();
  expect(publicResponse.status).toBe(200);
  expect(publicResponse.headers.get("cache-control")).toBe("no-store");
  expect(await publicResponse.json()).toEqual({ total: 0, today: 0, date: "2026-10-13" });
  const unauthorized = await route.POST(new NextRequest("http://localhost/api/visitor", {
    method: "POST", body: JSON.stringify({ ...payload, slug: [] }),
  }));
  expect(unauthorized.status).toBe(401);
  const invalid = await route.POST(new NextRequest("http://localhost/api/visitor", {
    method: "POST", headers: { "x-visitor-tracking-secret": "visitor-test-secret" },
    body: JSON.stringify({ pathname: "/", slug: null }),
  }));
  expect(invalid.status).toBe(400);
  const authorized = await route.POST(new NextRequest("http://localhost/api/visitor", {
    method: "POST", headers: { "x-visitor-tracking-secret": "visitor-test-secret" },
    body: JSON.stringify({ ...payload, slug: [] }),
  }));
  expect(authorized.status).toBe(201);
  expect((await (await route.GET()).json()).total).toBe(1);
});

test("only full page opens count: home and Thai pages count, APIs, assets and router fetches do not", async () => {
  const originalFetch = globalThis.fetch;
  const tracked = [];
  globalThis.fetch = async (_url, options) => {
    expect(options.headers["x-visitor-tracking-secret"]).toBe("visitor-test-secret");
    tracked.push(JSON.parse(options.body));
    return Response.json({ ok: true }, { status: 201 });
  };
  try {
    const cases = [
      ["/", {}, true], ["/th/structure", {}, true], ["/th/heart/game-id", {}, true],
      ["/private-path", {}, true], ["/th/heart", {}, false],
      ["/api/visitor", {}, false], ["/api/auth/session", {}, false],
      ["/_next/static/test.js", {}, false], ["/model.glb", {}, false], ["/music.mp3", {}, false],
      ["/favicon.ico", {}, false], ["/robots.txt", {}, false],
      ["/", { "purpose": "prefetch" }, false], ["/", { "next-router-prefetch": "1" }, false],
      ["/", { "sec-purpose": "prefetch" }, false], ["/", { "rsc": "1" }, false],
      ["/", { "sec-fetch-dest": "empty" }, false], ["/", { "accept": "application/json" }, false],
    ];
    for (const [pathname, extraHeaders, expected] of cases) {
      const waiting = [];
      const before = tracked.length;
      proxy(new NextRequest(`http://localhost${pathname}`, {
        headers: { accept: "text/html", "sec-fetch-dest": "document", ...extraHeaders },
      }), { waitUntil: (promise) => waiting.push(promise) });
      await Promise.all(waiting);
      expect(tracked.length - before).toBe(expected ? 1 : 0);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
