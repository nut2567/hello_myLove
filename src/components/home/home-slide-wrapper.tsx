"use client";

import { type ReactNode, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";

import { PixelProjectLogo } from "@/components/ui/pixel-project-logo";
import { siteConfig } from "@/lib/site";

type HomeSlideWrapperProps = {
  children: ReactNode;
};

const slideLabels = ["Access", "Bot", "Next"] as const;

export function HomeSlideWrapper({ children }: HomeSlideWrapperProps) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  function goToSlide(index: number) {
    const slideCount = slideLabels.length;
    const nextIndex = (index + slideCount) % slideCount;

    setActiveSlide(nextIndex);
    swiperRef.current?.slideTo(nextIndex);
  }

  return (
    <section
      aria-label="Home slides"
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <Swiper
        a11y={{
          containerMessage: "Home slides",
          nextSlideMessage: "Next home slide",
          prevSlideMessage: "Previous home slide",
        }}
        className="home-swiper w-full max-w-full"
        keyboard={{ enabled: true }}
        modules={[A11y, Keyboard]}
        onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        slidesPerView={1}
        speed={420}
      >
        <SwiperSlide className="flex items-center justify-center">
          {children}
        </SwiperSlide>

        <SwiperSlide className="flex items-center justify-center px-6 py-12">
          <div className="pixel-panel pixel-scan-panel flex min-h-104 w-full max-w-3xl flex-col items-center justify-center gap-10 p-8 text-center">
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
                The animated robot logo from the header now has its own slide so
                visitors can see the project identity before choosing a private
                path.
              </p>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide className="flex items-center justify-center px-6 py-12">
          <div className="pixel-panel pixel-scan-panel flex min-h-104 w-full max-w-3xl flex-col justify-center p-8">
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
        </SwiperSlide>
      </Swiper>

      <div className="border-t-4 border-border bg-black/50 px-6 py-4 mt-auto">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <button
            aria-label="Previous slide"
            className="pixel-button-secondary size-11 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-200"
            onClick={() => goToSlide(activeSlide - 1)}
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
                onClick={() => goToSlide(index)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <button
            aria-label="Next slide"
            className="pixel-button-secondary size-11 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-200"
            onClick={() => goToSlide(activeSlide + 1)}
            type="button"
          >
            <FaChevronRight aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
