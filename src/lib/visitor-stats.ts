import "server-only";

import type { ClientSession, Db } from "mongodb";

import {
  formatThaiDateString,
  formatThaiDateTimeString,
  getCurrentDate,
} from "@/lib/date-time";
import { getMongoClient, getMongoDatabase } from "@/lib/mongodb";

export const VISITOR_EVENTS_COLLECTION = "visitor_events";
export const VISITOR_STATS_COLLECTION = "visitor_stats";
const SITE_STATS_ID = "site";

type VisitorStatsDocument = {
  _id: string;
  total: number;
  daily: Record<string, number>;
  createdAt: string;
  updatedAt: string;
};

export type VisitorStats = {
  total: number;
  today: number;
  date: string;
};

// Run initialization and event writes in the same transaction so historical
// events are included once, even when the first visitors arrive together.
export async function ensureVisitorStats(
  db: Db,
  session: ClientSession,
): Promise<VisitorStatsDocument> {
  const collection = db.collection<VisitorStatsDocument>(VISITOR_STATS_COLLECTION);
  const existing = await collection.findOne({ _id: SITE_STATS_ID }, { session });
  if (existing) return existing;

  const [history] = await db.collection(VISITOR_EVENTS_COLLECTION)
    .aggregate<{
      total: { count: number }[];
      daily: { _id: string; count: number }[];
    }>([
      {
        $facet: {
          total: [{ $count: "count" }],
          daily: [
            { $match: { createdAt: { $regex: /^\d{4}-\d{2}-\d{2} / } } },
            {
              $group: {
                _id: { $substrBytes: ["$createdAt", 0, 10] },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ], { session }).toArray();

  const timestamp = formatThaiDateTimeString(getCurrentDate());
  const document: VisitorStatsDocument = {
    _id: SITE_STATS_ID,
    total: history?.total[0]?.count ?? 0,
    daily: Object.fromEntries(
      (history?.daily ?? []).map(({ _id, count }) => [_id, count]),
    ),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await collection.insertOne(document, { session });
  return document;
}

export async function incrementVisitorStats(
  db: Db,
  session: ClientSession,
  visitedAt: Date,
): Promise<void> {
  const date = formatThaiDateString(visitedAt);
  await db.collection<VisitorStatsDocument>(VISITOR_STATS_COLLECTION).updateOne(
    { _id: SITE_STATS_ID },
    {
      $inc: { total: 1, [`daily.${date}`]: 1 },
      $set: { updatedAt: formatThaiDateTimeString(visitedAt) },
    },
    { session },
  );
}

export async function getVisitorStats(): Promise<VisitorStats> {
  const db = await getMongoDatabase();
  let document = await db.collection<VisitorStatsDocument>(VISITOR_STATS_COLLECTION)
    .findOne({ _id: SITE_STATS_ID });

  if (!document) {
    const client = await getMongoClient();
    const session = client.startSession();
    try {
      document = await session.withTransaction(
        () => ensureVisitorStats(db, session),
        {
          readConcern: { level: "snapshot" },
          writeConcern: { w: "majority" },
          timeoutMS: 30_000,
        },
      );
    } finally {
      await session.endSession();
    }
  }

  const date = formatThaiDateString(getCurrentDate());
  return { total: document.total, today: document.daily[date] ?? 0, date };
}
