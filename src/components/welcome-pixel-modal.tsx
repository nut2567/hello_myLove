"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PixelRobot } from "./robot-drag-game/V1/PixelRobot";
import {
  getCurrentTimestamp,
  getNextThaiDailyDate,
} from "@/lib/date-time";

const pathChips = [
  "/th/structure",
  "/th/heart",
  "/th/logo",
  "/th/RobotDragGame",
] as const satisfies readonly Route[];

const WELCOME_COOKIE_NAME = "welcome_pixel_hidden_until";

function getCookieValue(name: string): string | null {
  const cookies = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean);
  const prefix = `${name}=`;
  const match = cookies.find((cookie) => cookie.startsWith(prefix));

  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function getNextWelcomeResetDate() {
  return getNextThaiDailyDate({ hour: 11, minute: 59 });
}

function hideWelcomeModalToday() {
  const expiresAt = getNextWelcomeResetDate();

  document.cookie = [
    `${WELCOME_COOKIE_NAME}=${encodeURIComponent(String(expiresAt.getTime()))}`,
    `expires=${expiresAt.toUTCString()}`,
    "path=/",
    "SameSite=Lax",
  ].join("; ");
}

function shouldHideWelcomeModal() {
  const hiddenUntil = Number(getCookieValue(WELCOME_COOKIE_NAME));

  return Number.isFinite(hiddenUntil) && getCurrentTimestamp() < hiddenUntil;
}

function getWelcomeModalSnapshot() {
  return !shouldHideWelcomeModal();
}

function subscribeToWelcomeCookie(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);

  return () => undefined;
}

export function WelcomePixelModal() {
  const shouldShowFromCookie = useSyncExternalStore(
    subscribeToWelcomeCookie,
    getWelcomeModalSnapshot,
    () => false,
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [rememberToday, setRememberToday] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = shouldShowFromCookie && !isDismissed;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    startButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (rememberToday) {
          hideWelcomeModalToday();
        }

        setIsDismissed(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, rememberToday]);

  function closeModal() {
    if (rememberToday) {
      hideWelcomeModalToday();
    }

    setIsDismissed(true);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="welcome-pixel-title"
      aria-modal="true"
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/72 px-4 py-8 backdrop-blur-sm"
      onMouseDown={closeModal}
      role="dialog"
    >
      <div
        className="pixel-panel pixel-panel-boot pixel-scan-panel w-full max-w-lg p-5"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="absolute right-3 top-3 flex gap-1" aria-hidden="true">
          <span className="h-2 w-2 bg-cyan-300" />
          <span className="h-2 w-2 bg-lime-300" />
          <span className="h-2 w-2 bg-fuchsia-300" />
        </div>

        <div className="flex items-start gap-4 pr-12">
          <div className="pixel-float shrink-0 pt-1">
            <PixelRobot
              accentClassName="bg-cyan-300"
              isDragging={false}
              isMoving
              name="Pixel"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-normal text-cyan-200">
              Pixel system online
            </p>
            <h2
              className="mt-3 text-3xl font-black leading-tight tracking-normal text-white"
              id="welcome-pixel-title"
            >
              Welcome to my project webapp
              <span className="pixel-cursor text-lime-300">_</span>
            </h2>
          </div>
        </div>

        <p className="mt-5 border-y-4 border-white/80 py-4 text-sm font-bold leading-6 text-zinc-100">
          You can access every path here and enjoy the web app, private rooms,
          robot game, heart page, logo page, and project structure.
        </p>

        <div
          className="mt-5 grid gap-2 sm:grid-cols-2"
          aria-label="Available paths"
        >
          {pathChips.map((path) => (
            <Link
              className="pixel-chip px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              href={path}
              key={path}
            >
              {path}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="pixel-button px-5 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
            onClick={closeModal}
            ref={startButtonRef}
            type="button"
          >
            Start explore
          </button>
          <Link
            className="pixel-button-secondary px-5 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-200"
            href="/th/RobotDragGame"
            onClick={closeModal}
          >
            Play robot game
          </Link>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-xs font-black uppercase text-cyan-100">
          <input
            checked={rememberToday}
            className="size-5 accent-lime-300"
            onChange={(event) => setRememberToday(event.target.checked)}
            type="checkbox"
          />
          Don&apos;t show again today
        </label>
      </div>
    </div>
  );
}
