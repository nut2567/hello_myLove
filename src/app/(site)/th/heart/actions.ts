"use server";

import { auth } from "@/auth";
import { getMongoDatabase } from "@/lib/mongodb";
import { isHeartId } from "@/lib/heart-id";

type SaveHeartGameScoreInput = {
  currentHeartId: string;
  score: number;
};

type HeartGameScoreDocument = {
  currentHeartId: string;
  pathName: string;
  pathType: string | null;
  score: number;
  createdAt: Date;
  createdAtThai: string;
};

export type SaveHeartGameScoreResult =
  | { ok: true; saved: true }
  | { ok: true; saved: false; reason: "unauthenticated" }
  | { ok: false; saved: false; reason: "invalid-score" | "invalid-heart-id" };

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

function isValidScore(score: number): boolean {
  return Number.isSafeInteger(score) && score >= 0 && score <= 1_000_000;
}

export async function saveHeartGameScore({
  currentHeartId,
  score,
}: SaveHeartGameScoreInput): Promise<SaveHeartGameScoreResult> {
  const session = await auth();
  const pathName = session?.user?.pathName;
  const pathType = session?.user?.pathType ?? null;

  if (!pathName) {
    return { ok: true, saved: false, reason: "unauthenticated" };
  }

  if (!isValidScore(score)) {
    return { ok: false, saved: false, reason: "invalid-score" };
  }

  if (!isHeartId(currentHeartId)) {
    return { ok: false, saved: false, reason: "invalid-heart-id" };
  }

  const now = new Date();
  const document: HeartGameScoreDocument = {
    currentHeartId,
    pathName,
    pathType,
    score,
    createdAt: now,
    createdAtThai: formatThaiDateTimeString(now),
  };

  const db = await getMongoDatabase();
  await db.collection<HeartGameScoreDocument>("heart_game").insertOne(document);

  return { ok: true, saved: true };
}
