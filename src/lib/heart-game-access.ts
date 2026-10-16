import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getCurrentTimestamp } from "@/lib/date-time";

const COOKIE_NAME = "heart-game-captcha";
const MAX_AGE_SECONDS = 2 * 60 * 60;

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(`heart-game-captcha:v1:${value}`).digest("hex");
}

export function createHeartGamePass(): { value: string; expiresAt: number } {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) throw new Error("reCAPTCHA is not configured.");
  const expiresAt = getCurrentTimestamp() + MAX_AGE_SECONDS * 1000;
  const payload = `${expiresAt}.${randomBytes(16).toString("hex")}`;
  return { value: `${payload}.${sign(payload, secret)}`, expiresAt };
}

export function readHeartGamePass(value: string | undefined): number | null {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret || !value || value.length > 160) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [expiry, nonce, signature] = parts;
  if (!/^\d{13}$/.test(expiry) || !/^[a-f0-9]{32}$/.test(nonce) ||
      !/^[a-f0-9]{64}$/.test(signature)) return null;
  const expiresAt = Number(expiry);
  const now = getCurrentTimestamp();
  if (expiresAt <= now || expiresAt > now + MAX_AGE_SECONDS * 1000) return null;
  const expected = Buffer.from(sign(`${expiry}.${nonce}`, secret), "hex");
  return timingSafeEqual(Buffer.from(signature, "hex"), expected) ? expiresAt : null;
}

export async function getHeartGameAccessExpiry(): Promise<number | null> {
  return readHeartGamePass((await cookies()).get(COOKIE_NAME)?.value);
}

export async function grantHeartGameAccess(): Promise<number> {
  const pass = createHeartGamePass();
  (await cookies()).set(COOKIE_NAME, pass.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/th/heart",
    maxAge: MAX_AGE_SECONDS,
  });
  return pass.expiresAt;
}
