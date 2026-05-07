import Link from "next/link";
import { ViewTransition } from "react";
import { IoMdHeart } from "react-icons/io";

type CatchAllPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

function HomePageContent() {
  return (
    <div className="flex h-full my-auto items-center justify-center">
      <ViewTransition name="IoMdHeart">
        <Link href="/A">
          <IoMdHeart className="text-red-300 size-20 cursor-pointer" />
        </Link>
      </ViewTransition>
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
