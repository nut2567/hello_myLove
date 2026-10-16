
import { TranslatedText } from "@/components/translated-text";

import { Suspense } from "react";
import { HeartGameClient } from "@/components/heart-game-client";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getRecaptchaSiteKey } from "@/lib/recaptcha";
import { getHeartGameAccessExpiry } from "@/lib/heart-game-access";
import {
  getHeartPosition,
  isHeartId,
} from "@/lib/heart-id";

type HeartIdPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function validateHeartId(id: string): string {
  if (!isHeartId(id)) {
    notFound();
  }

  return id;
}

export default async function HeartIdPage({ params }: HeartIdPageProps) {
  const { id } = await params;
  const heartId = validateHeartId(id);
  const position = getHeartPosition(heartId);
  const session = await auth();

  return (
    <main className="relative flex flex-1 overflow-hidden">
      <Suspense
        fallback={
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="pixel-panel px-5 py-3 text-sm font-black uppercase text-cyan-200"><TranslatedText messageKey={"HeartGame.loadingHeartGame"} /></div>
          </div>
        }
      >
        <HeartGameClient
          key={heartId}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          currentHeartId={heartId}
          authenticatedPlayerName={session?.user?.pathName ?? null}
          captchaExpiry={await getHeartGameAccessExpiry()}
          recaptchaSiteKey={getRecaptchaSiteKey()}
          style={position}
        />
      </Suspense>
    </main>
  );
}
