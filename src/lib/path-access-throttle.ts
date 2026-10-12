import "server-only";

import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { MongoServerError, type MongoClient } from "mongodb";
import { getCurrentTimestamp } from "@/lib/date-time";

export const PATH_ACCESS_WINDOW_MS = 15 * 60 * 1000;
export const PATH_ACCESS_PATH_LIMIT = 10;
export const PATH_ACCESS_IP_LIMIT = 50;
export const PATH_ACCESS_ATTEMPTS_COLLECTION = "path_access_attempts";

type AttemptDocument = {
  _id: string;
  attempts: number;
  windowEndsAtMs: number;
  expiresAt: Date;
};

const indexPromises = new WeakMap<MongoClient, Map<string, Promise<string>>>();

export function getPathAccessClientIp(headers: Headers): string {
  const forwardedIp = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  for (const ip of [forwardedIp, realIp]) {
    if (ip && isIP(ip)) return ip.toLowerCase();
  }
  return "unknown";
}

export async function reservePathAccessAttempt({
  client,
  databaseName,
  name,
  headers,
}: {
  client: MongoClient;
  databaseName: string;
  name: string;
  headers: Headers;
}): Promise<boolean> {
  const collection = client.db(databaseName).collection<AttemptDocument>(
    PATH_ACCESS_ATTEMPTS_COLLECTION,
  );
  let databaseIndexes = indexPromises.get(client);
  if (!databaseIndexes) {
    databaseIndexes = new Map();
    indexPromises.set(client, databaseIndexes);
  }
  let indexPromise = databaseIndexes.get(databaseName);
  if (!indexPromise) {
    indexPromise = collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    databaseIndexes.set(databaseName, indexPromise);
  }
  try {
    await indexPromise;
  } catch (error) {
    databaseIndexes.delete(databaseName);
    throw error;
  }

  const now = getCurrentTimestamp();
  const limits = [
    { scope: "path", value: name, limit: PATH_ACCESS_PATH_LIMIT },
    { scope: "ip", value: getPathAccessClientIp(headers), limit: PATH_ACCESS_IP_LIMIT },
  ];
  for (const { scope, value, limit } of limits) {
    const key = createHash("sha256").update(`${scope}\0${value}`).digest("hex");
    const activeWindow = { $gt: ["$windowEndsAtMs", now] };
    const update = [
      {
        $set: {
          attempts: {
            $cond: [
              activeWindow,
              { $min: [{ $add: [{ $ifNull: ["$attempts", 0] }, 1] }, limit + 1] },
              1,
            ],
          },
          windowEndsAtMs: {
            $cond: [activeWindow, "$windowEndsAtMs", now + PATH_ACCESS_WINDOW_MS],
          },
        },
      },
      { $set: { expiresAt: { $toDate: "$windowEndsAtMs" } } },
    ];
    let attempt;
    try {
      attempt = await collection.findOneAndUpdate(
        { _id: key }, update, { upsert: true, returnDocument: "after" },
      );
    } catch (error) {
      // Concurrent first attempts can race on the unique _id; retry against the winner.
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
      attempt = await collection.findOneAndUpdate(
        { _id: key }, update, { returnDocument: "after" },
      );
    }
    if (!attempt || attempt.attempts > limit) return false;
  }
  return true;
}
