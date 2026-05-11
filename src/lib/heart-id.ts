import type { Route } from "next";

export type HeartPosition = {
  left: `${number}%`;
  top: `${number}%`;
};

const MIN_HEART_ID = 100_000;
const MAX_HEART_ID = 999_999;

export function createHeartId(excludedId?: string): number {
  const range = MAX_HEART_ID - MIN_HEART_ID + 1;
  let nextId: number;

  do {
    nextId = Math.floor(Math.random() * range) + MIN_HEART_ID;
  } while (String(nextId) === excludedId);

  return nextId;
}

export function createHeartRoute(id = createHeartId(), score?: number): Route {
  const scoreQuery = typeof score === "number" ? `?score=${score}` : "";

  return `/th/heart/${id}${scoreQuery}` as Route;
}

export function isHeartId(value: string): boolean {
  return /^\d+$/.test(value);
}

function hashId(id: string): number {
  let hash = 2_166_136_261;

  for (const character of id) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}

function seededFraction(seed: number, salt: number): number {
  let value = seed + Math.imul(salt, 2_654_435_761);

  value ^= value >>> 16;
  value = Math.imul(value, 2_246_822_507);
  value ^= value >>> 13;
  value = Math.imul(value, 3_266_489_909);
  value ^= value >>> 16;

  return (value >>> 0) / 4_294_967_295;
}

export function getHeartPosition(id: string): HeartPosition {
  const seed = hashId(id);
  const left = 12 + Math.round(seededFraction(seed, 1) * 76);
  const top = 12 + Math.round(seededFraction(seed, 2) * 76);

  return {
    left: `${left}%`,
    top: `${top}%`,
  };
}
