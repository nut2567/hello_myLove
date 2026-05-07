import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

type VisitorPayload = {
  pathname: string;
  slug: string[];
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  latitude: string | null;
  longitude: string | null;
};

const ASSET_EXTENSION_PATTERN =
  /\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|png|svg|webp|woff2?)$/i;

const EXCLUDED_PATHS = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);

function getNullableHeader(headers: Headers, name: string): string | null {
  const value = headers.get(name)?.trim();

  return value && value.length > 0 ? value : null;
}

function getDecodedNullableHeader(headers: Headers, name: string): string | null {
  const value = getNullableHeader(headers, name);

  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  if (forwardedIp) {
    return forwardedIp;
  }

  return headers.get("x-real-ip")?.trim() ?? null;
}

function getSlug(pathname: string): string[] {
  return pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function shouldTrackRequest(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;

  if (request.method !== "GET") {
    return false;
  }

  if (EXCLUDED_PATHS.has(pathname)) {
    return false;
  }

  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/_next/data") ||
    pathname === "/api/visitor" ||
    pathname.startsWith("/api/visitor/") ||
    ASSET_EXTENSION_PATTERN.test(pathname)
  ) {
    return false;
  }

  if (
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose") === "prefetch" ||
    request.headers.has("next-router-prefetch")
  ) {
    return false;
  }

  return true;
}

function createVisitorPayload(request: NextRequest): VisitorPayload {
  const { pathname } = request.nextUrl;

  return {
    pathname,
    slug: getSlug(pathname),
    ip: getClientIp(request.headers),
    userAgent: getNullableHeader(request.headers, "user-agent"),
    referer: getNullableHeader(request.headers, "referer"),
    country: getDecodedNullableHeader(request.headers, "x-vercel-ip-country"),
    city: getDecodedNullableHeader(request.headers, "x-vercel-ip-city"),
    region: getDecodedNullableHeader(
      request.headers,
      "x-vercel-ip-country-region",
    ),
    latitude: getDecodedNullableHeader(request.headers, "x-vercel-ip-latitude"),
    longitude: getDecodedNullableHeader(request.headers, "x-vercel-ip-longitude"),
  };
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (shouldTrackRequest(request)) {
    const visitorUrl = new URL("/api/visitor", request.url);
    const payload = createVisitorPayload(request);

    event.waitUntil(
      fetch(visitorUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      })
        .then(() => undefined)
        .catch(() => undefined),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/visitor).*)",
};
