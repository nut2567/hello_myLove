import "server-only";

import type { ObjectId } from "mongodb";
import { getCurrentThaiDateTimeString } from "@/lib/date-time";
import { getMongoClient } from "@/lib/mongodb";
import { reservePathAccessAttempt } from "@/lib/path-access-throttle";
import { hashPathPin, isPathPinHash, matchesLegacyPin, verifyPathPin } from "@/lib/path-password";

const USER_COLLECTION_NAME = "user";
const NEW_USER_COLLECTION_NAME = "newUser";
const EXISTING_USER_LOG_COLLECTION_NAME = "logOnUser";

export type PathLink = {
  url: string;
  rate: number | null;
};

export type PublicPathUser = {
  name: string;
  type: string | null;
  music: PathLink[];
};

type PathUserDocument = {
  name?: unknown;
  pin?: unknown;
  pinHash?: unknown;
  type?: unknown;
  music?: unknown;
  sessionId?: unknown;
};

type PathUserQuery = {
  name: string;
};

export function getDatabaseName(): string {
  return process.env.DATABASE_NAME ?? "port";
}
type NewPathRequestDocument = {
  _id?: string | ObjectId;
  path: string;
  pin?: unknown;
  pinHash?: unknown;
  createdAt: string;
  lastPinChangedAtThai: string | null;
  pinChangeCount: number;
  updatedAt: string;
};

type ExistingPathUserLogDocument = {
  _id: string;
  path: string;
  visitCount: number;
  successCount: number;
  wrongPasswordCount: number;
  firstVisitedAtThai: string;
  latestVisitedAtThai: string;
  updatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toPathLink(value: unknown): PathLink | null {
  if (!isRecord(value) || typeof value.url !== "string") {
    return null;
  }

  const url = value.url.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return null;
  }

  return {
    url,
    rate: typeof value.rate === "number" ? value.rate : null,
  };
}

function toPublicPathUser(
  document: PathUserDocument | null,
): PublicPathUser | null {
  if (!document || typeof document.name !== "string") {
    return null;
  }

  const music = Array.isArray(document.music)
    ? document.music
        .map(toPathLink)
        .filter((item): item is PathLink => item !== null)
    : [];

  return {
    name: document.name,
    type: typeof document.type === "string" ? document.type : null,
    music,
  };
}

function normalizePathName(value: string): string | null {
  const normalized = value.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length !== 1) {
    return null;
  }

  const name = segments[0].toLowerCase();

  if (!/^[a-z0-9_-]{1,64}$/.test(name)) {
    return null;
  }

  return name;
}

export function normalizePathNameValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return normalizePathName(value);
}

export function normalizeSubmittedPathName(
  value: FormDataEntryValue | null,
): string | null {
  return normalizePathNameValue(value);
}

export function normalizeSlugPathName(slug: string[]): string | null {
  return normalizePathName(slug.join("/"));
}

async function findPathUser(
  query: PathUserQuery,
): Promise<PublicPathUser | null> {
  const client = await getMongoClient();
  const document = await client
    .db(getDatabaseName())
    .collection<PathUserDocument>(USER_COLLECTION_NAME)
    .findOne(query, {
      projection: {
        _id: 0,
        name: 1,
        type: 1,
        music: 1,
      },
    });

  return toPublicPathUser(document);
}

export async function getPathUserByName(
  name: string,
): Promise<PublicPathUser | null> {
  return findPathUser({ name });
}

export async function getPathUserByCredentials({
  name,
  pin,
}: { name: string; pin: string }): Promise<PublicPathUser | null> {
  return (await getPathCredentialIdentity({ name, pin }))?.user ?? null;
}

export async function getPathCredentialIdentity({
  name,
  pin,
}: {
  name: string;
  pin: string;
}): Promise<{ user: PublicPathUser; sessionId: string } | null> {
  const client = await getMongoClient();
  const collection = client.db(getDatabaseName()).collection<PathUserDocument>(USER_COLLECTION_NAME);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const document = await collection.findOne({ name }, {
      projection: { name: 1, type: 1, music: 1, pin: 1, pinHash: 1, sessionId: 1 },
    });
    if (!document) return null;
    const user = toPublicPathUser(document);
    if (!user) return null;
    const identity = { user, sessionId: typeof document.sessionId === "string" ? document.sessionId : String(document._id) };
    if (document.pinHash !== undefined) {
      return await verifyPathPin(document.pinHash, pin) ? identity : null;
    }
    if (!matchesLegacyPin(document.pin, pin)) return null;

    // Upgrade a legacy credential atomically without overwriting a concurrent password change.
    const pinHash = await hashPathPin(pin);
    const result = await collection.updateOne(
      { _id: document._id, pin: { $eq: document.pin }, pinHash: { $exists: false } },
      { $set: { pinHash }, $unset: { pin: "" } },
    );
    if (result.matchedCount > 0) return identity;
  }
  return null;
}

export async function upsertNewPathRequest({
  name,
  pin,
}: {
  name: string;
  pin: string;
}): Promise<void> {
  const client = await getMongoClient();
  const nowThai = getCurrentThaiDateTimeString();
  const collection = client.db(getDatabaseName()).collection<NewPathRequestDocument>(NEW_USER_COLLECTION_NAME);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const previous = await collection.findOne({ path: name });
    if (previous?.pinHash !== undefined && !isPathPinHash(previous.pinHash)) {
      throw new Error("Stored path request credential is invalid.");
    }
    const samePin = previous?.pinHash !== undefined
      ? await verifyPathPin(previous.pinHash, pin)
      : matchesLegacyPin(previous?.pin, pin);
    const pinHash = samePin && isPathPinHash(previous?.pinHash)
      ? previous.pinHash
      : await hashPathPin(pin);

    if (!previous) {
      const result = await collection.updateOne(
        { _id: name },
        { $setOnInsert: {
          path: name, pinHash, createdAt: nowThai, updatedAt: nowThai,
          pinChangeCount: 0, lastPinChangedAtThai: null,
        } },
        { upsert: true },
      );
      if (result.upsertedCount > 0) return;
      continue;
    }

    const hadPin = previous.pinHash !== undefined || typeof previous.pin === "string";
    const changed = hadPin && !samePin;
    const result = await collection.updateOne(
      {
        _id: previous._id,
        pinHash: previous.pinHash === undefined ? { $exists: false } : { $eq: previous.pinHash },
        pin: previous.pin === undefined ? { $exists: false } : { $eq: previous.pin },
      },
      [
        { $set: {
          path: name,
          pinHash: { $literal: pinHash },
          createdAt: { $ifNull: ["$createdAt", { $ifNull: ["$createdAtThai", nowThai] }] },
          pinChangeCount: { $add: [{ $ifNull: ["$pinChangeCount", 0] }, changed ? 1 : 0] },
          lastPinChangedAtThai: changed ? nowThai : { $ifNull: ["$lastPinChangedAtThai", null] },
          updatedAt: nowThai,
        } },
        { $unset: "pin" },
      ],
    );
    if (result.matchedCount > 0) return;
  }
  throw new Error("Path request changed concurrently; try again.");
}

export async function logExistingPathUserAccess({
  name,
  passwordCorrect,
}: {
  name: string;
  passwordCorrect: boolean;
}): Promise<void> {
  const client = await getMongoClient();
  const nowThai = getCurrentThaiDateTimeString();

  await client
    .db(getDatabaseName())
    .collection<ExistingPathUserLogDocument>(
      EXISTING_USER_LOG_COLLECTION_NAME,
    )
    .updateOne(
      { _id: name },
      [
        {
          $set: {
            path: name,
            visitCount: { $add: [{ $ifNull: ["$visitCount", 0] }, 1] },
            successCount: {
              $add: [
                { $ifNull: ["$successCount", 0] },
                passwordCorrect ? 1 : 0,
              ],
            },
            wrongPasswordCount: {
              $add: [
                { $ifNull: ["$wrongPasswordCount", 0] },
                passwordCorrect ? 0 : 1,
              ],
            },
            firstVisitedAtThai: {
              $ifNull: ["$firstVisitedAtThai", nowThai],
            },
            latestVisitedAtThai: nowThai,
            updatedAt: nowThai,
          },
        },
        { $unset: "wrongpass" },
      ],
      { upsert: true },
    );
}

export async function authenticatePathUser({
  name,
  pin,
  headers,
}: {
  name: string;
  pin: string;
  headers: Headers;
}): Promise<
  | { status: "authenticated"; user: PublicPathUser; sessionId: string }
  | { status: "invalid-password" | "request-pending" | "rate-limited" }
> {
  const client = await getMongoClient();
  if (!await reservePathAccessAttempt({ client, databaseName: getDatabaseName(), name, headers })) {
    return { status: "rate-limited" };
  }
  const existingUser = await getPathUserByName(name);
  if (!existingUser) {
    await upsertNewPathRequest({ name, pin });
    return { status: "request-pending" };
  }
  const identity = await getPathCredentialIdentity({ name, pin });
  try {
    await logExistingPathUserAccess({ name, passwordCorrect: Boolean(identity) });
  } catch {
    console.error("Failed to save path access result; no credentials were logged.");
  }
  return identity ? { status: "authenticated", ...identity } : { status: "invalid-password" };
}
