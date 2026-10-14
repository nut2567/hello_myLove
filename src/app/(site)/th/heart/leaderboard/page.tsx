import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { MdFavorite, MdEmojiEvents } from "react-icons/md";

import { HeartLeaderboardRefresh } from "@/components/heart-leaderboard-refresh";
import { TranslatedText } from "@/components/translated-text";
import { getHeartGameLeaderboard } from "@/lib/heart-game-leaderboard";

export const metadata: Metadata = {
  title: "กระดานคะแนนเกมหัวใจ",
  description: "ดูอันดับผู้เล่นที่ทำคะแนนสูงสุดในเกมหัวใจ เปิดดูได้โดยไม่ต้องใส่รหัสผ่าน",
};

export default async function HeartLeaderboardPage() {
  await connection();
  const entries = await getHeartGameLeaderboard();

  return (
    <section className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-accent">
          <MdEmojiEvents aria-hidden className="size-6" />
          <TranslatedText messageKey="HeartLeaderboard.publicAccess" />
        </p>
        <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">
          <TranslatedText messageKey="HeartLeaderboard.title" />
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          <TranslatedText messageKey="HeartLeaderboard.description" />
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="pixel-button min-h-11 gap-2 px-4 py-3 text-sm" href="/th/heart">
            <MdFavorite aria-hidden className="size-5" />
            <TranslatedText messageKey="HeartLeaderboard.play" />
          </Link>
          <HeartLeaderboardRefresh />
        </div>
      </header>

      <div className="pixel-panel p-4 sm:p-6">
        {entries.length === 0 ? (
          <div className="py-10 text-center">
            <MdFavorite aria-hidden className="mx-auto mb-4 size-10 text-accent" />
            <h2 className="text-xl font-bold text-foreground">
              <TranslatedText messageKey="HeartLeaderboard.emptyTitle" />
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              <TranslatedText messageKey="HeartLeaderboard.emptyDescription" />
            </p>
          </div>
        ) : (
          <table className="w-full table-fixed text-left text-sm sm:text-base">
            <caption className="pb-5 text-left text-sm leading-6 text-muted-foreground">
              <TranslatedText messageKey="HeartLeaderboard.tableDescription" />
            </caption>
            <thead>
              <tr className="border-b-2 border-border text-muted-foreground">
                <th className="w-[24%] pb-4 pr-1 sm:w-24 sm:pr-2" scope="col">
                  <TranslatedText messageKey="HeartLeaderboard.rank" />
                </th>
                <th className="break-words pb-4 pr-2" scope="col">
                  <TranslatedText messageKey="HeartLeaderboard.player" />
                </th>
                <th className="w-[42%] pb-4 text-right sm:w-36" scope="col">
                  <TranslatedText messageKey="HeartLeaderboard.bestScore" />
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr className="border-b border-border last:border-0" key={index}>
                  <td className="py-5 pr-2 align-top font-mono font-black text-accent">
                    <span className="flex items-center gap-1 sm:gap-2">
                      {entry.rank === 1 ? <MdEmojiEvents aria-hidden className="size-4 shrink-0" /> : null}
                      {entry.rank}
                    </span>
                  </td>
                  <th className="break-words py-5 pr-2 align-top font-bold text-foreground [overflow-wrap:anywhere]" scope="row">
                    {entry.name}
                  </th>
                  <td className="py-5 text-right align-top font-mono text-xs font-black tabular-nums text-accent sm:text-base">
                    {entry.score.toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
