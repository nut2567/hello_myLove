import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

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

const VISITOR_TRACKING_SECRET_HEADER = "x-visitor-tracking-secret";

const ASSET_EXTENSION_PATTERN =
  /\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|png|svg|webp|woff2?|ttf|otf|txt|xml|pdf|mp3|mp4|webm|wav|glb|gltf)$/i;

const EXCLUDED_PATHS = new Set([
  "/favicon.ico", "/robots.txt", "/sitemap.xml",
  "/th/heart", // Redirects to the actual game page, which counts the visit.
]);

const EXCLUDED_PATH_PREFIXES = ["/api", "/_next"];

function matchesPathOrPrefix(pathname: string, pathPrefix: string): boolean {
  return pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`);
}

function getNullableHeader(headers: Headers, name: string): string | null {
  const value = headers.get(name)?.trim();

  return value && value.length > 0 ? value : null;
}

function getDecodedNullableHeader(
  headers: Headers,
  name: string,
): string | null {
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

function getVisitorTrackingSecret(): string | null {
  const secret = process.env.VISITOR_TRACKING_SECRET?.trim();

  return secret && secret.length > 0 ? secret : null;
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
    EXCLUDED_PATH_PREFIXES.some((pathPrefix) =>
      matchesPathOrPrefix(pathname, pathPrefix),
    )
  ) {
    return false;
  }

  if (ASSET_EXTENSION_PATTERN.test(pathname)) {
    return false;
  }

  if (
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose") === "prefetch" ||
    request.headers.has("next-router-prefetch")
  ) {
    return false;
  }

  // Count full page opens/refreshes, rather than RSC fetches or background
  // requests triggered by the router, query changes, and cached navigation.
  if (
    request.headers.has("rsc") ||
    !request.headers.get("accept")?.includes("text/html") ||
    (request.headers.has("sec-fetch-dest") &&
      request.headers.get("sec-fetch-dest") !== "document")
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
    longitude: getDecodedNullableHeader(
      request.headers,
      "x-vercel-ip-longitude",
    ),
  };
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const visitorTrackingSecret = getVisitorTrackingSecret();

  if (visitorTrackingSecret && shouldTrackRequest(request)) {
    const visitorUrl = new URL("/api/visitor", request.url);
    const payload = createVisitorPayload(request);

    event.waitUntil(
      fetch(visitorUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [VISITOR_TRACKING_SECRET_HEADER]: visitorTrackingSecret,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      })
        .then((response) => {
          if (!response.ok) console.error("Visitor tracking failed:", response.status);
        })
        .catch(() => console.error("Visitor tracking request failed.")),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher:
    "/((?!_next|favicon.ico|robots.txt|sitemap.xml|api/).*)",
};
