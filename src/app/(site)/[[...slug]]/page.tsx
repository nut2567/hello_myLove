import { notFound, redirect } from "next/navigation";
import { CredentialsSignin } from "next-auth";

import { auth, signIn } from "@/auth";
import { HomeSlideWrapper } from "@/components/home/home-slide-wrapper";
import { PathAccessForm } from "@/components/path-access-form";
import { WelcomePixelModal } from "@/components/welcome-pixel-modal";
import {
  getPathUserByName,
  normalizeSlugPathName,
  normalizeSubmittedPathName,
  type PathLink,
  type PublicPathUser,
} from "@/lib/path-access";
import { normalizePathPin } from "@/lib/path-password";
import { isPathSessionCurrent } from "@/lib/path-session";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";

type CatchAllPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const INVALID_PASSWORD_QUERY_VALUE = "invalid";
const NEW_PATH_REQUEST_QUERY_VALUE = "notfound";
const RATE_LIMITED_QUERY_VALUE = "limited";

async function unlockSubmittedPath(formData: FormData) {
  "use server";

  const name = normalizeSubmittedPathName(formData.get("path"));

  if (!name) {
    notFound();
  }

  const session = await auth();

  if (await isPathSessionCurrent(session, name)) {
    redirect(`/${name}`);
  }

  const pin = normalizePathPin(formData.get("pin"));

  if (!pin) {
    notFound();
  }

  let failureCode: string | undefined;
  try {
    await signIn("path-access", {
      path: name,
      pin,
      redirectTo: `/${name}`,
    });
  } catch (error) {
    if (!(error instanceof CredentialsSignin)) throw error;
    failureCode = error.code;
  }
  if (failureCode === "request-pending") {
    redirect(`/${name}?request=${NEW_PATH_REQUEST_QUERY_VALUE}`);
  }
  if (failureCode === "rate-limited") {
    redirect(`/${name}?password=${RATE_LIMITED_QUERY_VALUE}`);
  }
  if (failureCode) {
    redirect(`/${name}?password=${INVALID_PASSWORD_QUERY_VALUE}`);
  }
}

function getFirstSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getLinkTitle(link: PathLink, index: number): string {
  try {
    return new URL(link.url).hostname.replace(/^www\./, "");
  } catch {
    return `Link ${index + 1}`;
  }
}

function getYouTubeVideoId(url: URL): string | null {
  const hostname = url.hostname.replace(/^www\./, "");

  if (hostname === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] ?? null;
  }

  if (
    hostname !== "youtube.com" &&
    hostname !== "m.youtube.com" &&
    hostname !== "music.youtube.com"
  ) {
    return null;
  }

  if (url.pathname === "/watch") {
    return url.searchParams.get("v");
  }

  const [, route, videoId] = url.pathname.split("/");

  if (route === "embed" || route === "shorts" || route === "live") {
    return videoId || null;
  }

  return null;
}

function parseYouTubeTime(value: string | null): number | null {
  if (!value) {
    return null;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);

  if (!match) {
    return null;
  }

  const [, hours = "0", minutes = "0", seconds = "0"] = match;
  const total = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);

  return total > 0 ? total : null;
}

function getVideoEmbedUrl(link: PathLink): string | null {
  try {
    const url = new URL(link.url);
    const youtubeVideoId = getYouTubeVideoId(url);

    if (youtubeVideoId) {
      const embedUrl = new URL(
        `https://www.youtube.com/embed/${youtubeVideoId}`,
      );
      const startSeconds =
        parseYouTubeTime(url.searchParams.get("t")) ??
        parseYouTubeTime(url.searchParams.get("start"));

      if (startSeconds !== null) {
        embedUrl.searchParams.set("start", String(startSeconds));
      }

      return embedUrl.toString();
    }

    return null;
  } catch {
    return null;
  }
}

function getDirectVideoType(url: string): string | null {
  const pathname = url.split("?")[0]?.toLowerCase() ?? "";

  if (pathname.endsWith(".mp4")) {
    return "video/mp4";
  }

  if (pathname.endsWith(".webm")) {
    return "video/webm";
  }

  if (pathname.endsWith(".ogg") || pathname.endsWith(".ogv")) {
    return "video/ogg";
  }

  return null;
}

function MissingPathContent({
  name,
  requestSaved,
}: {
  name: string;
  requestSaved: boolean;
}) {
  return (
    <section className="flex flex-1 items-center justify-center bg-background px-6 py-14 text-foreground">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-normal text-accent">
          Page not found
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
          ยังไม่พบหน้า /{name}
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          {"ยังไม่มี path นี้ กำลังพัฒนารอสักครู่นะครับ แล้วกลับมาใหม่"}
        </p>
        {requestSaved ? (
          <p className="mt-4 text-sm font-semibold text-accent">
            Request saved for this path.
          </p>
        ) : null}
        <Link
          className="mt-8 inline-flex h-11 items-center justify-center rounded-md border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          href="/"
        >
          กลับไปหน้าแรก
        </Link>
      </div>
    </section>
  );
}

function PrivatePathContent({ user }: { user: PublicPathUser }) {
  return (
    <section className="bg-background py-14 text-foreground">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-accent">
            Private path
          </p>
          {user.type ? (
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              {user.type}
            </p>
          ) : null}
        </div>

        {user.music.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {user.music.map((link, index) => {
              const embedUrl = getVideoEmbedUrl(link);
              const directVideoType = getDirectVideoType(link.url);

              return (
                <article
                  className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft"
                  key={`${link.url}-${index}`}
                >
                  {embedUrl ? (
                    <div className="aspect-video bg-background">
                      <iframe
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="h-full w-full"
                        src={embedUrl}
                        title={`Video ${index + 1}`}
                      />
                    </div>
                  ) : directVideoType ? (
                    <video
                      className="aspect-video w-full bg-background"
                      controls
                    >
                      <source src={link.url} type={directVideoType} />
                      Your browser does not support the video tag.
                    </video>
                  ) : null}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-accent">
                          {getLinkTitle(link, index)}
                        </p>
                        <h2 className="mt-3 break-all text-lg font-semibold text-foreground">
                          {embedUrl || directVideoType ? "Video" : "Open link"}
                        </h2>
                      </div>
                      {link.rate !== null ? (
                        <span className="rounded-md border border-accent/25 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                          {link.rate}/10
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-4 break-all font-mono text-xs leading-5 text-muted-foreground">
                      {link.url}
                    </p>

                    {!embedUrl && !directVideoType ? (
                      <ButtonLink
                        // className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-accent bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                        href={link.url}
                        rel="noreferrer"
                        target="_blank"
                        external
                      >
                        Open URL
                      </ButtonLink>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-border bg-surface p-6 text-muted-foreground shadow-soft">
            No links are available for this path yet.
          </div>
        )}
      </div>
    </section>
  );
}

export default async function CatchAllPage({
  params,
  searchParams,
}: CatchAllPageProps) {
  const { slug = [] } = await params;

  if (slug.length === 0) {
    const session = await auth();

    return (
      <>
        <WelcomePixelModal />
        <HomeSlideWrapper>
          <PathAccessForm
            action={unlockSubmittedPath}
            authenticatedPathName={session?.user?.pathName && await isPathSessionCurrent(session, session.user.pathName) ? session.user.pathName : null}
          />
        </HomeSlideWrapper>
      </>
    );
  }

  const name = normalizeSlugPathName(slug);

  if (!name) {
    notFound();
  }

  const [user, session, resolvedSearchParams] = await Promise.all([
    getPathUserByName(name),
    auth(),
    searchParams,
  ]);

  if (!user) {
    const requestSaved =
      getFirstSearchParam(resolvedSearchParams, "request") ===
      NEW_PATH_REQUEST_QUERY_VALUE;

    return <MissingPathContent name={name} requestSaved={requestSaved} />;
  }

  if (!await isPathSessionCurrent(session, name)) {
    const isRateLimited = getFirstSearchParam(resolvedSearchParams, "password") === RATE_LIMITED_QUERY_VALUE;
    const hasInvalidPassword =
      getFirstSearchParam(resolvedSearchParams, "password") ===
      INVALID_PASSWORD_QUERY_VALUE;

    return (
      <PathAccessForm
        action={unlockSubmittedPath}
        authenticatedPathName={session?.user?.pathName && await isPathSessionCurrent(session, session.user.pathName) ? session.user.pathName : null}
        errorMessage={
          isRateLimited
            ? "ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอให้ครบช่วงพัก 15 นาทีแล้วลองใหม่"
            : hasInvalidPassword
              ? "Path หรือรหัสไม่ถูกต้อง กรุณาลองใหม่หรือติดต่อ admin"
              : undefined
        }
        initialModalOpen
        initialPath={name}
      />
    );
  }

  return <PrivatePathContent user={user} />;
}
