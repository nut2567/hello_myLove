"use client";

import { useTranslations } from "next-intl";

import { type ReactNode, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { MdAdminPanelSettings } from "react-icons/md";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";

import { PixelProjectLogo } from "@/components/ui/pixel-project-logo";
import { siteConfig } from "@/lib/site";

type HomeSlideWrapperProps = {
  children: ReactNode;
};

const slideLabels = ["Home.access", "Home.bot", "Home.admin"] as const;

export function HomeSlideWrapper({ children }: HomeSlideWrapperProps) {
  const t = useTranslations();
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
      aria-label={t("Home.homeSlides")}
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <Swiper
        a11y={{
          containerMessage: t("Home.homeSlides"),
          nextSlideMessage: t("Home.nextHomeSlide"),
          prevSlideMessage: t("Home.previousHomeSlide"),
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
            <p className="text-xs font-black uppercase tracking-normal text-cyan-200">{t("Home.headerAnimationPreview")}</p>
            <div className="flex h-28 w-full items-center justify-center">
              <div className="scale-100 sm:scale-[1.75]">
                <PixelProjectLogo name={siteConfig.name} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black leading-tight tracking-normal text-white sm:text-4xl">{t("Home.sameLogoBiggerStage")}</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm font-bold leading-6 text-zinc-100 sm:text-base">{t("Home.theAnimatedRobotLogoFromTheHeaderNowHasIts")}</p>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide className="flex items-center justify-center px-6 py-12">
          <div className="pixel-panel pixel-scan-panel flex min-h-104 w-full max-w-3xl flex-col items-center justify-center p-6 text-center sm:p-8">
            <MdAdminPanelSettings
              aria-hidden
              className="size-16 text-cyan-200 sm:size-20"
            />
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-normal text-white sm:text-5xl">{t("Admin.title")}</h2>
            <p className="mt-5 max-w-xl text-sm font-bold leading-6 text-zinc-100 sm:text-base">{t("Home.createUsersSetPasswordsAndAddMusicOrVideosTo")}</p>
            <Link
              className="pixel-button mt-8 min-h-12 gap-2 px-5 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
              href="/admin"
              prefetch={false}
            >
              <MdAdminPanelSettings aria-hidden className="size-5 shrink-0" />{t("Home.openAdmin")}</Link>
          </div>
        </SwiperSlide>
      </Swiper>

      <div className="border-t-4 border-border bg-black/50 py-4 mt-auto">
        <div className="container mx-auto flex items-center justify-between gap-4 px-6">
          <button
            aria-label={t("Home.previousSlide")}
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
                {t(label)}
              </button>
            ))}
          </div>

          <button
            aria-label={t("Home.nextSlide")}
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
