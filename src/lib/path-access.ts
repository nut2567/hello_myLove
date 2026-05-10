import "server-only";

import crypto from "node:crypto";

import { getMongoClient } from "@/lib/mongodb";

const DATABASE_NAME = "port";
const COLLECTION_NAME = "user";
const ACCESS_COOKIE_PREFIX = "path_access_";

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

function getAccessSecret(): string {
  const secret =
    process.env.PATH_ACCESS_SECRET ??
    process.env.MONGODB_URI ??
    process.env.nana_technology_MONGODB_URI;

  if (!secret) {
    throw new Error("PATH_ACCESS_SECRET or MONGODB_URI is not configured.");
  }

  return secret;
}

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

export function normalizeSubmittedPathName(
  value: FormDataEntryValue | null,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return normalizePathName(value);
}

export function normalizeSlugPathName(slug: string[]): string | null {
  return normalizePathName(slug.join("/"));
}

async function findPathUser(
  query: PathUserQuery,
): Promise<PublicPathUser | null> {
  const client = await getMongoClient();
  const document = await client
    .db(DATABASE_NAME)
    .collection<PathUserDocument>(COLLECTION_NAME)
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

export function getPathAccessCookieName(name: string): string {
  return `${ACCESS_COOKIE_PREFIX}${name}`;
}

export function createPathAccessToken(name: string): string {
  return crypto
    .createHmac("sha256", getAccessSecret())
    .update(`path:${name}`)
    .digest("base64url");
}

export function isValidPathAccessToken({
  name,
  token,
}: {
  name: string;
  token: string | undefined;
}): boolean {
  if (!token) {
    return false;
  }

  const expected = createPathAccessToken(name);
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);

  return (
    tokenBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(tokenBuffer, expectedBuffer)
  );
}
