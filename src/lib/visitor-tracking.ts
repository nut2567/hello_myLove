import crypto from "node:crypto";

import { formatThaiDateTimeString, getCurrentDate } from "@/lib/date-time";
import { getMongoDatabase } from "@/lib/mongodb";

const VISITOR_EVENTS_COLLECTION_NAME = "visitor_events";

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
    createdAt: formatThaiDateTimeString(getCurrentDate()),
  };

  const db = await getMongoDatabase();
  await db
    .collection<VisitorEventDocument>(VISITOR_EVENTS_COLLECTION_NAME)
    .insertOne(document);
}
