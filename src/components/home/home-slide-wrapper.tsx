"use client";

import { type ReactNode, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

import { PixelProjectLogo } from "@/components/ui/pixel-project-logo";
import { siteConfig } from "@/lib/site";

type HomeSlideWrapperProps = {
  children: ReactNode;
};

const slideLabels = ["Access", "Logo", "Next"] as const;

export function HomeSlideWrapper({ children }: HomeSlideWrapperProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  function scrollToSlide(index: number) {
    const slideCount = slideLabels.length;
    const nextIndex = (index + slideCount) % slideCount;
    const viewport = viewportRef.current;

    setActiveSlide(nextIndex);
    viewport?.scrollTo({
      left: viewport.clientWidth * nextIndex,
      behavior: "smooth",
    });
  }

  function syncActiveSlide() {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    setActiveSlide(Math.round(viewport.scrollLeft / viewport.clientWidth));
  }

  return (
    <section
      aria-label="Home slides"
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <div
        className="flex min-h-[calc(100dvh-10rem)] w-full max-w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
        onScroll={syncActiveSlide}
        ref={viewportRef}
      >
        <div className="flex w-full shrink-0 snap-center items-center justify-center">
          {children}
        </div>

        <div className="flex w-full shrink-0 snap-center items-center justify-center px-6 py-12">
          <div className="pixel-panel pixel-scan-panel flex min-h-[26rem] w-full max-w-3xl flex-col items-center justify-center gap-10 p-8 text-center">
            <p className="text-xs font-black uppercase tracking-normal text-cyan-200">
              Header animation preview
            </p>
            <div className="flex h-28 w-full items-center justify-center">
              <div className="scale-100 sm:scale-[1.75]">
                <PixelProjectLogo name={siteConfig.name} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black leading-tight tracking-normal text-white sm:text-4xl">
                Same logo, bigger stage.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm font-bold leading-6 text-zinc-100 sm:text-base">
                The animated robot logo from the header now has its own slide
                so visitors can see the project identity before choosing a
                private path.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 snap-center items-center justify-center px-6 py-12">
          <div className="pixel-panel pixel-scan-panel flex min-h-[26rem] w-full max-w-3xl flex-col justify-center p-8">
            <p className="text-xs font-black uppercase tracking-normal text-fuchsia-200">
              Next slide
            </p>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              More memories, games, and private pages are coming next.
            </h2>
            <p className="mt-6 max-w-2xl text-sm font-bold leading-6 text-zinc-100 sm:text-base">
              This space is ready for the next update. Add a gallery, a new
              mini-game, a message wall, or any special content without leaving
              the home slide wrapper empty.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t-4 border-border bg-black/50 px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <button
            aria-label="Previous slide"
            className="pixel-button-secondary size-11 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-200"
            onClick={() => scrollToSlide(activeSlide - 1)}
            type="button"
          >
            <FaChevronLeft aria-hidden />
          </button>

          <div className="flex flex-wrap justify-center gap-2">
            {slideLabels.map((label, index) => (
              <button
                aria-current={activeSlide === index ? "true" : undefined}
                className="pixel-chip px-3 py-2 text-xs"
                key={label}
                onClick={() => scrollToSlide(index)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <button
            aria-label="Next slide"
            className="pixel-button-secondary size-11 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-200"
            onClick={() => scrollToSlide(activeSlide + 1)}
            type="button"
          >
            <FaChevronRight aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
