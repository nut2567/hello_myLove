"use server";

import crypto from "node:crypto";

import { auth } from "@/auth";
import {
  formatThaiDateTimeString,
  getCurrentDate,
} from "@/lib/date-time";
import { getMongoDatabase } from "@/lib/mongodb";
import { isHeartId } from "@/lib/heart-id";

const HEART_GAME_PLAYER_COLLECTION_NAME = "heart_game_players";
const HEART_GAME_SCORE_COLLECTION_NAME = "heart_game";
const MAX_PLAYER_NAME_LENGTH = 40;

type SaveHeartGameScoreInput = {
  currentHeartId: string;
  player?: HeartGamePlayer | null;
  score: number;
};

export type HeartGamePlayerType = "guest" | "named";

export type HeartGamePlayer = {
  id: string;
  name: string;
  type: HeartGamePlayerType;
};

type HeartGameScoreDocument = {
  currentHeartId: string;
  pathName: string;
  pathType: string | null;
  playerId?: string;
  playerName?: string;
  playerType?: HeartGamePlayerType | "path";
  score: number;
  createdAt: Date;
  createdAtThai: string;
};

type HeartGamePlayerDocument = {
  playerId: string;
  playerName: string;
  createdAt: string;
};

type CreateHeartGamePlayerInput = {
  name?: string | null;
  type: HeartGamePlayerType;
};

export type CreateHeartGamePlayerResult =
  | { ok: true; player: HeartGamePlayer }
  | { ok: false; reason: "invalid-player-type" | "invalid-player-name" };

export type SaveHeartGameScoreResult =
  | { ok: true; saved: true }
  | { ok: false; saved: false; reason: "invalid-score" | "invalid-heart-id" | "invalid-player" };

function isValidScore(score: number): boolean {
  return Number.isSafeInteger(score) && score >= 0 && score <= 1_000_000;
}

function normalizePlayerName(name: string): string | null {
  const normalized = name.trim().replace(/\s+/g, " ");

  if (normalized.length === 0 || normalized.length > MAX_PLAYER_NAME_LENGTH) {
    return null;
  }

  return normalized;
}

function normalizeHeartGamePlayer(
  player: HeartGamePlayer | null | undefined,
): HeartGamePlayer | null {
  if (!player) {
    return null;
  }

  if (
    typeof player.id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      player.id,
    )
  ) {
    return null;
  }

  if (player.type !== "guest" && player.type !== "named") {
    return null;
  }

  const name = normalizePlayerName(player.name);

  if (!name) {
    return null;
  }

  return {
    id: player.id,
    name,
    type: player.type,
  };
}

export async function createHeartGamePlayer({
  name,
  type,
}: CreateHeartGamePlayerInput): Promise<CreateHeartGamePlayerResult> {
  if (type !== "guest" && type !== "named") {
    return { ok: false, reason: "invalid-player-type" };
  }

  const playerName =
    type === "guest" ? "Guest" : normalizePlayerName(name ?? "");

  if (!playerName) {
    return { ok: false, reason: "invalid-player-name" };
  }

  const player: HeartGamePlayer = {
    id: crypto.randomUUID(),
    name: playerName,
    type,
  };
  const document: HeartGamePlayerDocument = {
    playerId: player.id,
    playerName: player.name,
    createdAt: formatThaiDateTimeString(),
  };

  const db = await getMongoDatabase();
  await db
    .collection<HeartGamePlayerDocument>(HEART_GAME_PLAYER_COLLECTION_NAME)
    .insertOne(document);

  return { ok: true, player };
}

export async function saveHeartGameScore({
  currentHeartId,
  player,
  score,
}: SaveHeartGameScoreInput): Promise<SaveHeartGameScoreResult> {
  const session = await auth();
  const pathName = session?.user?.pathName;
  const pathType = session?.user?.pathType ?? null;

  if (!isValidScore(score)) {
    return { ok: false, saved: false, reason: "invalid-score" };
  }

  if (!isHeartId(currentHeartId)) {
    return { ok: false, saved: false, reason: "invalid-heart-id" };
  }

  const normalizedPlayer = normalizeHeartGamePlayer(player);

  if (!pathName && !normalizedPlayer) {
    return { ok: false, saved: false, reason: "invalid-player" };
  }

  const now = getCurrentDate();
  const document: HeartGameScoreDocument = {
    currentHeartId,
    pathName: pathName ?? normalizedPlayer?.name ?? "Guest",
    pathType,
    playerId: normalizedPlayer?.id,
    playerName: normalizedPlayer?.name,
    playerType: pathName ? "path" : normalizedPlayer?.type,
    score,
    createdAt: now,
    createdAtThai: formatThaiDateTimeString(now),
  };

  const db = await getMongoDatabase();
  await db
    .collection<HeartGameScoreDocument>(HEART_GAME_SCORE_COLLECTION_NAME)
    .insertOne(document);

  return { ok: true, saved: true };
}
