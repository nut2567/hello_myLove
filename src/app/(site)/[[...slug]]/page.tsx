import type { Route } from "next";
import { redirect } from "next/navigation";

type CatchAllPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

function normalizeSubmittedPath(value: FormDataEntryValue | null) {
  const rawPath = typeof value === "string" ? value.trim() : "";

  if (rawPath.length === 0) {
    return "/";
  }

  const path = rawPath.replace(/\\/g, "/").replace(/^\/+/, "");

  return `/${path}`;
}

async function goToSubmittedPath(formData: FormData) {
  "use server";

  redirect(normalizeSubmittedPath(formData.get("path")) as Route);
}

function HomePageContent() {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <form
        action={goToSubmittedPath}
        className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="path">
          Path
        </label>
        <input
          autoCapitalize="none"
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-md border border-border bg-surface px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25"
          id="path"
          inputMode="url"
          name="path"
          placeholder="ตัวอย่าง /nut"
          required
          spellCheck={false}
          type="text"
        />
        <button
          className="inline-flex h-11 items-center justify-center rounded-md border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug = [] } = await params;

  if (slug.length === 0) {
    return <HomePageContent />;
  }

  const pathname = `/${slug.join("/")}`;

  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase tracking-wide text-neutral-500">
        Dynamic path
      </p>
      <h1 className="max-w-3xl wrap-break-word text-3xl font-semibold text-neutral-950">
        {pathname}
      </h1>
    </main>
  );
}
