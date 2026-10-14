import { afterAll, beforeEach, expect, mock, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { Decimal128 } from "mongodb";

// Never write fixtures to the application's score collection.
if (process.env.DATABASE_NAME !== "development") {
  throw new Error("Leaderboard integration tests require DATABASE_NAME=development.");
}
const { getMongoClient } = await import("../src/lib/mongodb.ts");
const client = await getMongoClient();
const db = client.db("development");
const collectionName = `codex_heart_leaderboard_test_${randomUUID().replaceAll("-", "")}`;
const collection = db.collection(collectionName);
mock.module("../src/lib/mongodb.ts", () => ({
  getMongoDatabase: async () => ({
    collection: (name) => {
      expect(name).toBe("heart_game");
      return collection;
    },
  }),
}));
const { getHeartGameLeaderboard } = await import("../src/lib/heart-game-leaderboard.ts");

beforeEach(async () => { await collection.deleteMany({}); });
afterAll(async () => {
  try { await collection.drop(); } finally { await client.close(); }
});

test("returns an empty leaderboard without inventing scores", async () => {
  expect(await getHeartGameLeaderboard()).toEqual([]);
});

test("keeps only each authenticated or legacy player's best score", async () => {
  await collection.insertMany([
    { pathName: "alpha", score: 12 },
    { pathName: "alpha", score: 35, playerId: null },
    { pathName: "alpha", score: 8, playerId: "" },
    { pathName: "beta", score: 27 },
  ]);
  expect(await getHeartGameLeaderboard()).toEqual([
    { name: "alpha", score: 35, rank: 1 },
    { name: "beta", score: 27, rank: 2 },
  ]);
});

test("separates guests with identical names and groups repeated player IDs", async () => {
  const firstId = randomUUID();
  await collection.insertMany([
    { pathName: "Guest", playerId: firstId, score: 10 },
    { pathName: "Guest", playerId: firstId, score: 25 },
    { pathName: "Guest", playerId: randomUUID(), score: 20 },
    { pathName: "Guest", score: 15 },
  ]);
  expect(await getHeartGameLeaderboard()).toEqual([
    { name: "Guest", score: 25, rank: 1 },
    { name: "Guest", score: 20, rank: 2 },
    { name: "Guest", score: 15, rank: 3 },
  ]);
});

test("shares ranks for ties and orders names consistently", async () => {
  await collection.insertMany([
    { pathName: "gamma", score: 5 },
    { pathName: "beta", score: 30 },
    { pathName: "alpha", score: 30 },
  ]);
  expect(await getHeartGameLeaderboard()).toEqual([
    { name: "alpha", score: 30, rank: 1 },
    { name: "beta", score: 30, rank: 1 },
    { name: "gamma", score: 5, rank: 3 },
  ]);
});

test("limits players after grouping their best scores", async () => {
  await collection.insertMany(Array.from({ length: 60 }, (_, index) => [
    { pathName: `player-${index}`, score: index + 1 },
    { pathName: `player-${index}`, score: 0 },
  ]).flat());
  const entries = await getHeartGameLeaderboard();
  expect(entries).toHaveLength(50);
  expect(entries[0]).toEqual({ name: "player-59", score: 60, rank: 1 });
  expect(entries[49]).toEqual({ name: "player-10", score: 11, rank: 50 });
});

test("ignores malformed names and scores without breaking the page", async () => {
  await collection.insertMany([
    { pathName: "valid", score: 0 },
    { pathName: "  spaced  ", score: 1_000_000 },
    { pathName: "fraction", score: 2.5 },
    { pathName: "negative", score: -1 },
    { pathName: "over-limit", score: 1_000_001 },
    { pathName: "text", score: "100" },
    { pathName: "array", score: [100] },
    { pathName: "decimal", score: Decimal128.fromString("100") },
    { pathName: "missing" },
    { pathName: "", score: 100 },
    { pathName: "  ", score: 100 },
    { pathName: ["array-name"], score: 100 },
    { pathName: null, score: 100 },
    { score: 100 },
  ]);
  expect(await getHeartGameLeaderboard()).toEqual([
    { name: "spaced", score: 1_000_000, rank: 1 },
    { name: "valid", score: 0, rank: 2 },
  ]);
});

test("returns only public display fields and sees newly saved best scores", async () => {
  const playerId = randomUUID();
  await collection.insertOne({
    pathName: "named player", score: 10, playerId,
    pathType: "private", currentHeartId: "private-round", createdAt: "private-time",
  });
  expect(await getHeartGameLeaderboard()).toEqual([
    { name: "named player", score: 10, rank: 1 },
  ]);
  await collection.insertOne({ pathName: "named player", playerId, score: 20 });
  expect(await getHeartGameLeaderboard()).toEqual([
    { name: "named player", score: 20, rank: 1 },
  ]);
});
