import "server-only";

import { getMongoClient } from "@/lib/mongodb";

const USER_COLLECTION_NAME = "user";
const NEW_USER_COLLECTION_NAME = "newUser";
const EXISTING_USER_LOG_COLLECTION_NAME = "logOnUser";
const MAX_WRONG_PASSWORD_LOGS = 50;

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
  type?: unknown;
  music?: unknown;
};

type PathUserQuery = {
  name: string;
  pin?: string;
};

export function getDatabaseName(): string {
  return process.env.DATABASE_NAME ?? "port";
}
type NewPathRequestDocument = {
  path: string;
  pin: string;
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
  wrongpass: string[];
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

function formatThaiDateTimeString(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
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
}: {
  name: string;
  pin: string;
}): Promise<PublicPathUser | null> {
  return findPathUser({ name, pin });
}

export async function upsertNewPathRequest({
  name,
  pin,
}: {
  name: string;
  pin: string;
}): Promise<void> {
  const client = await getMongoClient();
  const now = new Date();
  const nowThai = formatThaiDateTimeString(now);
  const pinChangedExpression = {
    $and: [{ $ne: [{ $type: "$pin" }, "missing"] }, { $ne: ["$pin", pin] }],
  };

  await client
    .db(getDatabaseName())
    .collection<NewPathRequestDocument>(NEW_USER_COLLECTION_NAME)
    .updateOne(
      { path: name },
      [
        {
          $set: {
            path: name,
            pin,
            createdAt: { $ifNull: ["$createdAtThai", nowThai] },
            pinChangeCount: {
              $cond: [
                pinChangedExpression,
                { $add: [{ $ifNull: ["$pinChangeCount", 0] }, 1] },
                { $ifNull: ["$pinChangeCount", 0] },
              ],
            },
            lastPinChangedAtThai: {
              $cond: [
                pinChangedExpression,
                nowThai,
                { $ifNull: ["$lastPinChangedAtThai", null] },
              ],
            },
            updatedAt: nowThai,
          },
        },
      ],
      { upsert: true },
    );
}

export async function logExistingPathUserAccess({
  name,
  passwordCorrect,
  pin,
}: {
  name: string;
  passwordCorrect: boolean;
  pin: string;
}): Promise<void> {
  const client = await getMongoClient();
  const nowThai = formatThaiDateTimeString(new Date());

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
            wrongpass: passwordCorrect
              ? { $ifNull: ["$wrongpass", []] }
              : {
                  $slice: [
                    {
                      $concatArrays: [
                        { $ifNull: ["$wrongpass", []] },
                        [pin],
                      ],
                    },
                    -MAX_WRONG_PASSWORD_LOGS,
                  ],
                },
            firstVisitedAtThai: {
              $ifNull: ["$firstVisitedAtThai", nowThai],
            },
            latestVisitedAtThai: nowThai,
            updatedAt: nowThai,
          },
        },
      ],
      { upsert: true },
    );
}
