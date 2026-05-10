import { notFound } from "next/navigation";

import { auth, signIn } from "@/auth";
import { PathAccessForm } from "@/components/path-access-form";
import {
  getPathUserByCredentials,
  getPathUserByName,
  normalizeSlugPathName,
  normalizeSubmittedPathName,
  type PathLink,
  type PublicPathUser,
} from "@/lib/path-access";

type CatchAllPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

function readPin(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const pin = value.trim();

  return pin.length > 0 ? pin : null;
}

async function unlockSubmittedPath(formData: FormData) {
  "use server";

  const name = normalizeSubmittedPathName(formData.get("path"));
  const pin = readPin(formData.get("pin"));

  if (!name || !pin) {
    notFound();
  }

  const user = await getPathUserByCredentials({ name, pin });

  if (!user) {
    notFound();
  }

  await signIn("path-access", {
    path: name,
    pin,
    redirectTo: `/${name}`,
  });
}

function getLinkTitle(link: PathLink, index: number): string {
  try {
    return new URL(link.url).hostname.replace(/^www\./, "");
  } catch {
    return `Link ${index + 1}`;
  }
}

function PrivatePathContent({ user }: { user: PublicPathUser }) {
  return (
    <section className="bg-background px-6 py-14 text-foreground">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-accent">
            Private path
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
            /{user.name}
          </h1>
          {user.type ? (
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              {user.type}
            </p>
          ) : null}
        </div>

        {user.music.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {user.music.map((link, index) => (
              <a
                className="group rounded-lg border border-border bg-surface p-5 shadow-soft transition-colors hover:border-accent/40 hover:bg-muted"
                href={link.url}
                key={`${link.url}-${index}`}
                rel="noreferrer"
                target="_blank"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-accent">
                      {getLinkTitle(link, index)}
                    </p>
                    <h2 className="mt-3 break-all text-lg font-semibold text-foreground">
                      Open link
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
              </a>
            ))}
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

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug = [] } = await params;

  if (slug.length === 0) {
    return <PathAccessForm action={unlockSubmittedPath} />;
  }

  const name = normalizeSlugPathName(slug);

  if (!name) {
    notFound();
  }

  const session = await auth();

  if (session?.user?.pathName !== name) {
    notFound();
  }

  const user = await getPathUserByName(name);

  if (!user) {
    notFound();
  }

  return <PrivatePathContent user={user} />;
}
