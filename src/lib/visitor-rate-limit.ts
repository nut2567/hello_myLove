import "server-only";

import crypto from "node:crypto";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const VISITOR_EVENT_RATE_LIMIT_MAX = 5;
const VISITOR_EVENT_RATE_LIMIT_WINDOW = "1 m";

type RedisConfig = {
  url: string;
  token: string;
};

export type VisitorRateLimitInput = {
  ipHash: string;
  pathname: string;
  userAgent: string | null;
};

export type VisitorRateLimitResult = {
  allowed: boolean;
  limit?: number;
  reason:
    | "allowed"
    | "missing_redis_config"
    | "rate_limited"
    | "redis_error"
    | "redis_timeout";
  remaining?: number;
  reset?: number;
};

let visitorEventRatelimit: Ratelimit | null | undefined;

function getRedisConfig(): RedisConfig | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (url && token) {
    return { url, token };
  }

  return getRedisConfigFromConnectionUrl(process.env.REDIS_URL);
}

function getRedisConfigFromConnectionUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const token = decodeURIComponent(url.password);

    if (!hostname.endsWith(".upstash.io") || !token) {
      return null;
    }

    return {
      url: `https://${hostname}`,
      token,
    };
  } catch {
    return null;
  }
}

function getVisitorEventRatelimit(): Ratelimit | null {
  if (visitorEventRatelimit !== undefined) {
    return visitorEventRatelimit;
  }

  const redisConfig = getRedisConfig();

  if (!redisConfig) {
    visitorEventRatelimit = null;
    return visitorEventRatelimit;
  }

  visitorEventRatelimit = new Ratelimit({
    redis: new Redis(redisConfig),
    limiter: Ratelimit.slidingWindow(
      VISITOR_EVENT_RATE_LIMIT_MAX,
      VISITOR_EVENT_RATE_LIMIT_WINDOW,
    ),
    prefix: "visitor_events:rate_limit",
    timeout: 1_000,
  });

  return visitorEventRatelimit;
}

function createVisitorRateLimitIdentifier({
  ipHash,
  pathname,
  userAgent,
}: VisitorRateLimitInput): string {
  return crypto
    .createHash("sha256")
    .update([pathname, ipHash, userAgent ?? "unknown"].join("\0"))
    .digest("hex");
}

export async function checkVisitorEventRateLimit(
  input: VisitorRateLimitInput,
): Promise<VisitorRateLimitResult> {
  const ratelimit = getVisitorEventRatelimit();

  if (!ratelimit) {
    return {
      allowed: false,
      reason: "missing_redis_config",
    };
  }

  try {
    const result = await ratelimit.limit(
      createVisitorRateLimitIdentifier(input),
    );

    if (result.reason === "timeout") {
      return {
        allowed: false,
        limit: result.limit,
        reason: "redis_timeout",
        remaining: result.remaining,
        reset: result.reset,
      };
    }

    return {
      allowed: result.success,
      limit: result.limit,
      reason: result.success ? "allowed" : "rate_limited",
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    return {
      allowed: false,
      reason: "redis_error",
    };
  }
}
