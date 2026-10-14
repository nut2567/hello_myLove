import crypto from "node:crypto";

import { formatThaiDateTimeString, getCurrentDate } from "@/lib/date-time";
import { getMongoClient, getMongoDatabase } from "@/lib/mongodb";
import {
  ensureVisitorStats,
  incrementVisitorStats,
  VISITOR_EVENTS_COLLECTION,
} from "@/lib/visitor-stats";

export type VisitorEventInput = {
  pathname: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  latitude: string | null;
  longitude: string | null;
};

type VisitorEventDocument = {
  pathname: string;
  ipHash: string;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
};

function hashIp(ip: string | null): string {
  return crypto
    .createHash("sha256")
    .update(ip ?? "unknown")
    .digest("hex");
}

export async function saveVisitorEvent(
  payload: VisitorEventInput,
): Promise<void> {
  const visitedAt = getCurrentDate();
  const document: VisitorEventDocument = {
    pathname: payload.pathname,
    ipHash: hashIp(payload.ip),
    userAgent: payload.userAgent,
    referer: payload.referer,
    country: payload.country,
    city: payload.city,
    region: payload.region,
    latitude: payload.latitude,
    longitude: payload.longitude,
    createdAt: formatThaiDateTimeString(visitedAt),
  };

  const db = await getMongoDatabase();
  const client = await getMongoClient();
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await ensureVisitorStats(db, session);
      await db.collection<VisitorEventDocument>(VISITOR_EVENTS_COLLECTION)
        .insertOne(document, { session });
      await incrementVisitorStats(db, session, visitedAt);
    }, {
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
      timeoutMS: 30_000,
    });
  } finally {
    await session.endSession();
  }
}
