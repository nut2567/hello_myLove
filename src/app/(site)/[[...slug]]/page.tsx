type CatchAllPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

function HomePageContent() {
  return (
    <div className="flex h-full my-auto items-center justify-center"></div>
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
