import crypto from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import {
  saveVisitorEvent,
  type VisitorEventInput,
} from "@/lib/visitor-tracking";

export const runtime = "nodejs";

const VISITOR_TRACKING_SECRET_HEADER = "x-visitor-tracking-secret";

type ParsedVisitorPayload = VisitorEventInput;

type VisitorSecretValidationResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

type VisitorTrackingSecretStatus =
  | { configured: true; secret: string }
  | { configured: false };

type JsonObject = Record<string, unknown>;

function getVisitorTrackingSecret(): VisitorTrackingSecretStatus {
  const secret = process.env.VISITOR_TRACKING_SECRET?.trim();

  if (!secret) {
    return { configured: false };
  }

  return { configured: true, secret };
}

function secretsMatch(providedSecret: string, expectedSecret: string): boolean {
  const provided = Buffer.from(providedSecret, "utf8");
  const expected = Buffer.from(expectedSecret, "utf8");

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expected);
}

function validateVisitorTrackingSecret(
  request: NextRequest,
): VisitorSecretValidationResult {
  const secretStatus = getVisitorTrackingSecret();

  if (!secretStatus.configured) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Visitor tracking secret is not configured." },
        { status: 500 },
      ),
    };
  }

  const providedSecret = request.headers.get(VISITOR_TRACKING_SECRET_HEADER);

  if (!providedSecret || !secretsMatch(providedSecret, secretStatus.secret)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  return { ok: true };
}

type VisitorRequestPayload = {
  pathname: string;
  slug: string[];
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  latitude: string | null;
  longitude: string | null;
};

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNullableString(
  body: JsonObject,
  key: keyof VisitorRequestPayload,
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

function parseVisitorPayload(body: unknown): ParsedVisitorPayload | null {
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

export async function POST(request: NextRequest) {
  const secretValidation = validateVisitorTrackingSecret(request);

  if (!secretValidation.ok) {
    return secretValidation.response;
  }

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

  try {
    await saveVisitorEvent(payload);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save visitor event." },
      { status: 500 },
    );
  }
}
