import crypto from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { getCurrentDate } from "@/lib/date-time";
import { getMongoDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

type VisitorPayload = {
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
  createdAt: Date;
};

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNullableString(
  body: JsonObject,
  key: keyof VisitorPayload,
): string | null | undefined {
  const value = body[key];

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function readSlug(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (!value.every((segment) => typeof segment === "string")) {
    return null;
  }

  return value;
}

function parseVisitorPayload(body: unknown): VisitorPayload | null {
  if (!isJsonObject(body)) {
    return null;
  }

  const pathname = body.pathname;
  const slug = readSlug(body.slug);

  if (typeof pathname !== "string" || !pathname.startsWith("/") || !slug) {
    return null;
  }

  const ip = readNullableString(body, "ip");
  const userAgent = readNullableString(body, "userAgent");
  const referer = readNullableString(body, "referer");
  const country = readNullableString(body, "country");
  const city = readNullableString(body, "city");
  const region = readNullableString(body, "region");
  const latitude = readNullableString(body, "latitude");
  const longitude = readNullableString(body, "longitude");

  if (
    ip === undefined ||
    userAgent === undefined ||
    referer === undefined ||
    country === undefined ||
    city === undefined ||
    region === undefined ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return null;
  }

  return {
    pathname,
    ip,
    userAgent,
    referer,
    country,
    city,
    region,
    latitude,
    longitude,
  };
}

function hashIp(ip: string | null): string {
  return crypto
    .createHash("sha256")
    .update(ip ?? "unknown")
    .digest("hex");
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const payload = parseVisitorPayload(body);

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid visitor payload." },
      { status: 400 },
    );
  }

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
    createdAt: getCurrentDate(),
  };

  try {
    const db = await getMongoDatabase();
    await db
      .collection<VisitorEventDocument>("visitor_events")
      .insertOne(document);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save visitor event." },
      { status: 500 },
    );
  }
}
