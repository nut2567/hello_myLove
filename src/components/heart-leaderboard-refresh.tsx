"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MdRefresh } from "react-icons/md";

export function HeartLeaderboardRefresh() {
  const t = useTranslations("HeartLeaderboard");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="pixel-button-secondary min-h-11 gap-2 px-4 py-3 text-sm disabled:cursor-wait disabled:opacity-60"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      type="button"
    >
      <MdRefresh aria-hidden className={isPending ? "size-5 animate-spin motion-reduce:animate-none" : "size-5"} />
      {t(isPending ? "refreshing" : "refresh")}
    </button>
  );
}
