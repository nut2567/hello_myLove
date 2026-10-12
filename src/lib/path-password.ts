import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { hash, parseOptions, verify, type Options } from "@node-rs/argon2";

const MAX_PIN_BYTES = 1024;
const HASH_OPTIONS = {
  // The binding declares ambient const enums, which cannot be imported with isolatedModules.
  algorithm: 2, // Argon2id
  version: 1, // Argon2 version 0x13 (19)
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} satisfies Options;

export function normalizePathPin(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const pin = value.trim();
  return pin.length > 0 && Buffer.byteLength(pin, "utf8") <= MAX_PIN_BYTES
    ? pin
    : null;
}

export function isPathPinHash(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return parseOptions(value).algorithm === 2;
  } catch {
    return false;
  }
}

export async function hashPathPin(pin: string): Promise<string> {
  return hash(pin, HASH_OPTIONS);
}

export async function verifyPathPin(pinHash: unknown, pin: string): Promise<boolean> {
  if (!isPathPinHash(pinHash)) return false;
  try {
    return await verify(pinHash, pin);
  } catch {
    return false;
  }
}

// Only used to upgrade legacy plaintext credentials; these digests are never stored.
export function matchesLegacyPin(storedPin: unknown, pin: string): boolean {
  if (typeof storedPin !== "string") return false;
  return timingSafeEqual(
    createHash("sha256").update(storedPin).digest(),
    createHash("sha256").update(pin).digest(),
  );
}
