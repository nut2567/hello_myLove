import type { Route } from "next";
import { redirect } from "next/navigation";

type CatchAllPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

const formClassName = "grid w-full max-w-lg gap-4";
const labelClassName = "text-sm font-medium leading-6 text-foreground";
const fieldGroupClassName = "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]";
const inputClassName =
  "h-12 min-w-0 rounded-md border border-border bg-surface px-4 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25";
const buttonClassName =
  "inline-flex h-12 items-center justify-center rounded-md border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

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
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <form action={goToSubmittedPath} className={formClassName}>
        <label className={labelClassName} htmlFor="path">
          พิมพ์ชื่อตัวเองใน Path เพื่อไปยังหน้าเฉพาะของคุณ
        </label>
        <div className={fieldGroupClassName}>
          <input
            autoCapitalize="none"
            autoComplete="off"
            className={inputClassName}
            id="path"
            inputMode="url"
            name="path"
            placeholder="Example /nut"
            required
            spellCheck={false}
            type="text"
          />
          <button className={buttonClassName} type="submit">
            Submit
          </button>
        </div>
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
      <h1 className="max-w-3xl break-words text-3xl font-semibold text-neutral-950">
        {pathname}
      </h1>
    </main>
  );
}
