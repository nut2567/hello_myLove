import "server-only";

import { getMongoClient } from "@/lib/mongodb";

const USER_COLLECTION_NAME = "user";
const NEW_USER_COLLECTION_NAME = "newUser";

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
  createdAt: Date;
  updatedAt: Date;
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

  await client
    .db(getDatabaseName())
    .collection<NewPathRequestDocument>(NEW_USER_COLLECTION_NAME)
    .updateOne(
      { path: name },
      {
        $set: {
          pin,
          updatedAt: now,
        },
        $setOnInsert: {
          path: name,
          createdAt: now,
        },
      },
      { upsert: true },
    );
}
