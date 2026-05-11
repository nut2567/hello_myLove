"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";

import { PixelRobot } from "@/components/PixelRobot";

const pathChips = [
  "/th/structure",
  "/th/heart",
  "/th/logo",
  "/th/RobotDragGame",
] as const satisfies readonly Route[];

export function WelcomePixelModal() {
  const [isOpen, setIsOpen] = useState(true);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    startButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="welcome-pixel-title"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/72 px-4 py-8 backdrop-blur-sm"
      onMouseDown={() => setIsOpen(false)}
      role="dialog"
    >
      <style>
        {`
          @keyframes welcomePixelBoot {
            0% { opacity: 0; transform: translateY(16px) scale(0.96); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }

          @keyframes welcomePixelBlink {
            0%, 42%, 100% { opacity: 1; }
            43%, 52% { opacity: 0.28; }
          }

          @keyframes welcomePixelScan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }

          @keyframes welcomePixelFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }

          .welcome-pixel-panel {
            animation: welcomePixelBoot 360ms steps(5, end) both;
            image-rendering: pixelated;
          }

          .welcome-pixel-cursor {
            animation: welcomePixelBlink 900ms steps(2, end) infinite;
          }

          .welcome-pixel-scan::after {
            animation: welcomePixelScan 2200ms linear infinite;
            background: linear-gradient(180deg, transparent, rgba(34, 211, 238, 0.16), transparent);
            content: "";
            inset: 0;
            pointer-events: none;
            position: absolute;
          }

          .welcome-pixel-float {
            animation: welcomePixelFloat 1200ms steps(3, end) infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .welcome-pixel-panel,
            .welcome-pixel-cursor,
            .welcome-pixel-scan::after,
            .welcome-pixel-float {
              animation: none;
            }
          }
        `}
      </style>

      <div
        className="welcome-pixel-panel welcome-pixel-scan relative w-full max-w-lg overflow-hidden border-4 border-white bg-black p-5 font-mono text-white shadow-[10px_10px_0_#22c55e]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="absolute right-3 top-3 flex gap-1" aria-hidden="true">
          <span className="h-2 w-2 bg-cyan-300" />
          <span className="h-2 w-2 bg-lime-300" />
          <span className="h-2 w-2 bg-fuchsia-300" />
        </div>

        <div className="flex items-start gap-4 pr-12">
          <div className="welcome-pixel-float shrink-0 pt-1">
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
              <span className="welcome-pixel-cursor text-lime-300">_</span>
            </h2>
          </div>
        </div>

        <p className="mt-5 border-y-4 border-white/80 py-4 text-sm font-bold leading-6 text-zinc-100">
          You can access every path here and enjoy the web app, private rooms,
          robot game, heart page, logo page, and project structure.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2" aria-label="Available paths">
          {pathChips.map((path) => (
            <Link
              className="border-2 border-white bg-zinc-950 px-3 py-2 text-xs font-bold text-cyan-100 shadow-[4px_4px_0_#374151] transition hover:bg-cyan-300 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              href={path}
              key={path}
            >
              {path}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="border-4 border-white bg-lime-300 px-5 py-3 text-sm font-black text-black shadow-[5px_5px_0_#ffffff] transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
            onClick={() => setIsOpen(false)}
            ref={startButtonRef}
            type="button"
          >
            Start explore
          </button>
          <Link
            className="border-4 border-white bg-zinc-950 px-5 py-3 text-sm font-black text-white shadow-[5px_5px_0_#374151] transition hover:bg-fuchsia-300 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-200"
            href="/th/RobotDragGame"
          >
            Play robot game
          </Link>
        </div>
      </div>
    </div>
  );
}
