import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { siteConfig, stackItems } from "@/lib/site";

export function HeroSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_24rem] lg:items-center lg:py-24">
        <div>
          <Badge>Next 16 + Tailwind 4</Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] text-foreground sm:text-6xl">
            {siteConfig.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {siteConfig.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={siteConfig.links.nextDocs} external>
              Next.js docs
            </ButtonLink>
            <ButtonLink
              href={siteConfig.links.tailwindDocs}
              variant="secondary"
              external
            >
              Tailwind docs
            </ButtonLink>
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-surface p-6 shadow-soft">
          <p className="text-sm font-medium uppercase text-muted-foreground">
            Runtime stack
          </p>
          <dl className="mt-6 divide-y divide-border">
            {stackItems.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[6.5rem_1fr] gap-4 py-4 first:pt-0 last:pb-0"
              >
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                <dd>
                  <p className="text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
