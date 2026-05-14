"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
  ViewTransition,
} from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { IoMdHeart } from "react-icons/io";
import { parseAsInteger, useQueryState } from "nuqs";

import {
  createHeartGamePlayer,
  saveHeartGameScore,
  type HeartGamePlayer,
  type HeartGamePlayerType,
} from "@/app/(site)/th/heart/actions";
import {
  useHeartGameDispatch,
  useHeartGameSelector,
} from "@/lib/heart-game-hooks";
import {
  markCheated,
  recordFakeHeartClick,
  recordHeartClick,
  resetHeartStatus,
} from "@/lib/heart-game-store";
import {
  createHeartId,
  createHeartRoute,
  getHeartPosition,
} from "@/lib/heart-id";

type HeartButtonProps = {
  "aria-label": string;
  authenticatedPlayerName?: string | null;
  className?: string;
  currentHeartId: string;
  style?: CSSProperties;
};

const HEART_SCORE_HEADER_SLOT_ID = "heart-score-header-slot";
const HEART_GAME_PLAYER_STORAGE_KEY = "heart-game-player-v1";
const POINTS_PER_FAKE_HEART = 10;

type FakeHeart = {
  id: string;
  style: ReturnType<typeof getHeartPosition>;
};

function getHeartScoreHeaderSlot() {
  return document.getElementById(HEART_SCORE_HEADER_SLOT_ID);
}

function subscribeToHeartScoreHeaderSlot(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}

function getStylePositionKey(style: CSSProperties | undefined): string {
  const left = typeof style?.left === "string" ? style.left : "none";
  const top = typeof style?.top === "string" ? style.top : "none";

  return `${left}-${top}`;
}

function createFakeHeart(index: number, score: number, styleKey: string) {
  const level = Math.max(1, Math.floor(score / POINTS_PER_FAKE_HEART));
  const seed = `fake-heart-${level}-${index}-${styleKey}`;

  return {
    id: seed,
    style: getHeartPosition(seed),
  };
}

type ScoreImageOptions = {
  label: string;
  score: number;
  title: string;
};

function createScoreImage({ label, score, title }: ScoreImageOptions) {
  const canvas = document.createElement("canvas");
  const pixelRatio = window.devicePixelRatio || 1;
  const width = 520;
  const height = 320;
  const context = canvas.getContext("2d");

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  if (!context) {
    return "";
  }

  context.scale(pixelRatio, pixelRatio);
  context.imageSmoothingEnabled = false;
  context.fillStyle = "#080812";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#111827";
  context.fillRect(18, 18, width - 36, height - 36);
  context.strokeStyle = "#67e8f9";
  context.lineWidth = 8;
  context.strokeRect(24, 24, width - 48, height - 48);
  context.strokeStyle = "#f472b6";
  context.lineWidth = 4;
  context.strokeRect(44, 44, width - 88, height - 88);

  context.fillStyle = "#fda4af";
  context.font =
    "900 34px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  context.textAlign = "center";
  context.fillText(title, width / 2, 96);

  context.fillStyle = "#bef264";
  context.font =
    "900 82px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  context.fillText(String(score), width / 2, 198);

  context.fillStyle = "#67e8f9";
  context.font =
    "800 24px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  context.fillText(label, width / 2, 246);

  for (let index = 0; index < 11; index += 1) {
    context.fillStyle = index % 2 === 0 ? "#f472b6" : "#22d3ee";
    context.fillRect(52 + index * 40, 276, 18, 18);
  }

  return canvas.toDataURL("image/png");
}

function isStoredHeartGamePlayer(value: unknown): value is HeartGamePlayer {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const player = value as Record<string, unknown>;

  return (
    typeof player.id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      player.id,
    ) &&
    typeof player.name === "string" &&
    player.name.trim().length > 0 &&
    player.name.trim().length <= 40 &&
    (player.type === "guest" || player.type === "named")
  );
}

function readStoredHeartGamePlayer(): HeartGamePlayer | null {
  try {
    const storedValue = window.localStorage.getItem(
      HEART_GAME_PLAYER_STORAGE_KEY,
    );

    if (!storedValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    return isStoredHeartGamePlayer(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

function storeHeartGamePlayer(player: HeartGamePlayer) {
  window.localStorage.setItem(
    HEART_GAME_PLAYER_STORAGE_KEY,
    JSON.stringify(player),
  );
}

export function HeartButton({
  "aria-label": ariaLabel,
  authenticatedPlayerName = null,
  className = "",
  currentHeartId,
  style,
}: HeartButtonProps) {
  const router = useRouter();
  const dispatch = useHeartGameDispatch();
  const score = useHeartGameSelector((state) => state.heartGame.score);
  const cheated = useHeartGameSelector((state) => state.heartGame.cheated);
  const gameOver = useHeartGameSelector((state) => state.heartGame.gameOver);
  const gameOverScore = useHeartGameSelector(
    (state) => state.heartGame.gameOverScore,
  );
  const [urlScore, setUrlScore] = useQueryState(
    "score",
    parseAsInteger.withDefault(0),
  );
  const scoreHeaderSlot = useSyncExternalStore(
    subscribeToHeartScoreHeaderSlot,
    getHeartScoreHeaderSlot,
    () => null,
  );
  const [fakeHearts, setFakeHearts] = useState<FakeHeart[]>([]);
  const [player, setPlayer] = useState<HeartGamePlayer | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerReady, setPlayerReady] = useState(false);
  const [playerSaveError, setPlayerSaveError] = useState<string | null>(null);
  const [savingPlayerType, setSavingPlayerType] =
    useState<HeartGamePlayerType | null>(null);
  const trustedUrlScoresRef = useRef<Set<number>>(new Set([0]));
  const hasAuthenticatedPlayer = Boolean(authenticatedPlayerName);
  const activePlayer = hasAuthenticatedPlayer ? null : player;
  const canPlay = hasAuthenticatedPlayer || Boolean(activePlayer);
  const shouldShowPlayerPopup = playerReady && !canPlay;
  const stylePositionKey = getStylePositionKey(style);
  const scorePopup = useMemo(() => {
    if (cheated) {
      return {
        fileName: "heart-game-loser-score.png",
        label: "SCORE RESET",
        score: 0,
        title: "LOSER",
      };
    }

    if (gameOver) {
      return {
        fileName: "heart-game-final-score.png",
        label: "FINAL SCORE",
        score: gameOverScore,
        title: "GAME OVER",
      };
    }

    return null;
  }, [cheated, gameOver, gameOverScore]);
  const scorePopupImage = useMemo(() => {
    if (!scorePopup || typeof document === "undefined") {
      return "";
    }

    return createScoreImage(scorePopup);
  }, [scorePopup]);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) {
        return;
      }

      if (hasAuthenticatedPlayer) {
        setPlayer(null);
        setPlayerReady(true);
        return;
      }

      setPlayer(readStoredHeartGamePlayer());
      setPlayerReady(true);
    });

    return () => {
      active = false;
    };
  }, [hasAuthenticatedPlayer]);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) {
        return;
      }

      setFakeHearts(
        Array.from(
          { length: Math.floor(score / POINTS_PER_FAKE_HEART) },
          (_, index) => createFakeHeart(index, score, stylePositionKey),
        ),
      );
    });

    return () => {
      active = false;
    };
  }, [score, stylePositionKey]);

  useEffect(() => {
    if (urlScore === score) {
      trustedUrlScoresRef.current = new Set([score]);
      return;
    }

    if (trustedUrlScoresRef.current.has(urlScore)) {
      return;
    }

    trustedUrlScoresRef.current = new Set([0]);
    dispatch(markCheated());
    void setUrlScore(0, { history: "replace" });
  }, [dispatch, score, setUrlScore, urlScore]);

  async function createPlayer(type: HeartGamePlayerType, name?: string) {
    setSavingPlayerType(type);
    setPlayerSaveError(null);

    try {
      const result = await createHeartGamePlayer({ name, type });

      if (!result.ok) {
        setPlayerSaveError(
          result.reason === "invalid-player-name"
            ? "Enter a name between 1 and 40 characters."
            : "Player type is invalid.",
        );
        return;
      }

      setPlayer(result.player);
      storeHeartGamePlayer(result.player);
      setPlayerName("");
    } catch (error) {
      console.error("Failed to save heart game player.", error);
      setPlayerSaveError("Could not save player. Try again.");
    } finally {
      setSavingPlayerType(null);
    }
  }

  function playAsGuest() {
    void createPlayer("guest");
  }

  function submitPlayerName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void createPlayer("named", playerName);
  }

  function goToRandomHeart() {
    if (!canPlay) {
      return;
    }

    const nextScore = score + 1;
    const nextHeartId = createHeartId(currentHeartId);
    const previousTrustedScores = trustedUrlScoresRef.current;

    trustedUrlScoresRef.current = new Set([
      ...previousTrustedScores,
      nextScore,
    ]);
    dispatch(recordHeartClick());
    router.push(createHeartRoute(nextHeartId, nextScore), { scroll: false });
  }

  function endGameFromFakeHeart() {
    if (!canPlay) {
      return;
    }

    void saveHeartGameScore({
      currentHeartId,
      player: activePlayer,
      score,
    }).catch((error: unknown) => {
      console.error("Failed to save heart game score.", error);
    });

    trustedUrlScoresRef.current = new Set([0, urlScore]);
    dispatch(recordFakeHeartClick());
    void setUrlScore(0, { history: "replace" });
  }

  function closeScorePopup() {
    dispatch(resetHeartStatus());
  }

  function downloadScoreImage() {
    if (!scorePopup || !scorePopupImage) {
      return;
    }

    const link = document.createElement("a");

    link.download = scorePopup.fileName;
    link.href = scorePopupImage;
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
  }

  const scoreStatus = (
    <div
      aria-live="polite"
      className="pixel-chip px-3 py-2 text-center text-[11px] leading-tight sm:text-xs"
    >
      {cheated ? (
        <p className="font-black uppercase text-red-200">
          You cheated in the game
        </p>
      ) : gameOver ? (
        <p className="font-black uppercase text-red-200">Game over</p>
      ) : (
        // !canPlay ? (
        //   <p className="font-black uppercase text-cyan-200">Choose player</p>
        // ) :
        <div className="flex gap-2 items-center justify-center">
          <p className="text-[10px] font-black uppercase text-cyan-200">
            {authenticatedPlayerName ?? activePlayer?.name}
          </p>
          <p className="font-black uppercase text-lime-200">Score {score}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {scoreHeaderSlot ? createPortal(scoreStatus, scoreHeaderSlot) : null}

      {shouldShowPlayerPopup
        ? createPortal(
            <div
              aria-label="Choose heart game player"
              aria-modal="true"
              className="fixed inset-0 z-[60] grid place-items-center bg-black/75 px-5 backdrop-blur-sm"
              role="dialog"
            >
              <div className="pixel-panel pixel-panel-boot grid w-full max-w-md gap-5 p-5">
                <div className="grid gap-2">
                  <p className="text-xs font-black uppercase text-cyan-200">
                    Heart game player
                  </p>
                  <h2 className="text-2xl font-black uppercase text-lime-200">
                    Who is playing?
                  </h2>
                </div>

                <button
                  className="pixel-chip min-h-12 px-4 py-3 text-sm font-black uppercase text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={savingPlayerType !== null}
                  onClick={playAsGuest}
                  type="button"
                >
                  {savingPlayerType === "guest"
                    ? "Saving guest"
                    : "Play as guest"}
                </button>

                <form className="grid gap-3" onSubmit={submitPlayerName}>
                  <label
                    className="text-xs font-black uppercase text-cyan-100"
                    htmlFor="heart-game-player-name"
                  >
                    Or enter your name
                  </label>
                  <input
                    autoComplete="nickname"
                    className="pixel-input h-12 w-full px-3 text-sm"
                    disabled={savingPlayerType !== null}
                    id="heart-game-player-name"
                    maxLength={40}
                    onChange={(event) => setPlayerName(event.target.value)}
                    placeholder="Player name"
                    type="text"
                    value={playerName}
                  />
                  {playerSaveError ? (
                    <p className="text-xs font-black uppercase text-red-200">
                      {playerSaveError}
                    </p>
                  ) : null}
                  <button
                    className="pixel-chip min-h-12 px-4 py-3 text-sm font-black uppercase text-lime-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      savingPlayerType !== null ||
                      playerName.trim().length === 0
                    }
                    type="submit"
                  >
                    {savingPlayerType === "named"
                      ? "Saving player"
                      : "Start with name"}
                  </button>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {scorePopup && scorePopupImage
        ? createPortal(
            <div
              aria-label={scorePopup.title}
              aria-modal="true"
              className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-5 backdrop-blur-sm"
              role="dialog"
            >
              <div className="pixel-panel grid max-w-xl gap-4 p-4">
                <Image
                  alt={`${scorePopup.title} score card`}
                  className="w-full max-w-[520px] border-4 border-cyan-300"
                  draggable={false}
                  height={320}
                  src={scorePopupImage}
                  unoptimized
                  width={520}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    className="pixel-chip px-4 py-3 text-sm font-black uppercase text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
                    onClick={downloadScoreImage}
                    type="button"
                  >
                    Download image
                  </button>
                  <button
                    className="pixel-chip px-4 py-3 text-sm font-black uppercase text-lime-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
                    onClick={closeScorePopup}
                    type="button"
                  >
                    Play again
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {fakeHearts.map((fakeHeart) => (
        <motion.button
          aria-label="Fake heart ends the game"
          animate={{
            opacity: [0.55, 1],
            scale: [0.78, 0.9],
          }}
          className="absolute z-20 inline-flex size-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center text-red-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          disabled={!canPlay}
          initial={{ opacity: 0, scale: 1 }}
          key={fakeHeart.id}
          onClick={endGameFromFakeHeart}
          style={fakeHeart.style}
          transition={{
            delay: 0.08,
            duration: 0.9,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          type="button"
        >
          <IoMdHeart aria-hidden className="size-20" />
        </motion.button>
      ))}

      <ViewTransition name="IoMdHeart">
        <motion.button
          aria-label={ariaLabel}
          animate={{
            opacity: [0.55, 1],
            scale: [0.78, 1],
          }}
          transition={{
            delay: 0.08,
            duration: 0.9,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className={`absolute z-10 inline-flex size-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center text-red-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${className}`}
          disabled={!canPlay}
          initial={{ opacity: 0, scale: 1 }}
          onClick={goToRandomHeart}
          style={style}
          type="button"
        >
          <IoMdHeart aria-hidden className="size-20" />
        </motion.button>
      </ViewTransition>
    </>
  );
}
