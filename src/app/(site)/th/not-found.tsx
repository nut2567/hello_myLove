import Link from "next/link";

export default function ThaiSectionNotFound() {
  return (
    <section className="flex flex-1 items-center border-b border-border bg-background px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-accent">
            /th route
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
            Thai page not found
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            หน้านี้ไม่มีในระบบ ถ้าหน้าที่จะ custom ต้องไม่มี /th นำหน้า
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="/th/structure"
            >
              View structure
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="/th/heart"
            >
              Open heart
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="/"
            >
              Go home
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-soft">
          <div className="grid gap-3 font-mono text-sm text-muted-foreground">
            <div className="rounded-md border border-border bg-muted p-4">
              <span className="text-accent">status</span>: 404
            </div>
            <div className="rounded-md border border-border bg-muted p-4">
              <span className="text-accent">scope</span>: /th/*
            </div>
            <div className="rounded-md border border-border bg-muted p-4">
              <span className="text-accent">file</span>:
              src/app/(site)/th/not-found.tsx
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
