import Link from "next/link";

export function ModelBackLink() {
  return (
    <Link
      className="pixel-button-secondary absolute left-4 top-4 z-20 h-10 px-4 text-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 sm:left-6 sm:top-6"
      href="/th/model"
    >
      Back to models
    </Link>
  );
}
