"use client";

import { useTranslations } from "next-intl";

import { useEffect, useId, useRef, useState } from "react";
import { IoAccessibilityOutline, IoClose } from "react-icons/io5";
import { useUiPreferences } from "@/components/ui-preferences-provider";

import {
  colorThemes,
  fontSizes,
  type ColorTheme,
  type FontSize,
} from "@/lib/ui-preferences";

const sizeLabels = {
  small: "size.small",
  normal: "size.normal",
  large: "size.large",
  xlarge: "size.xlarge",
};
const themeLabels = {
  normal: "color.normal",
  sharp1: "color.sharp1",
  sharp2: "color.sharp2",
};

export function AccessibilityControls() {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("AccessibilitySettings");
  const commonT = useTranslations("Common");
  const {
    locale,
    fontSize,
    colorTheme,
    setLocale,
    setFontSize,
    setColorTheme,
    resetAppearance,
  } = useUiPreferences();

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;

    function positionPopover() {
      if (!trigger || !popover) return;
      const margin = 16;
      const gap = 12;
      const anchor = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const height = Math.min(
        popover.scrollHeight + 8,
        viewportHeight - margin * 2,
      );
      const below = Math.max(0, viewportHeight - margin - anchor.bottom - gap);
      const above = Math.max(0, anchor.top - gap - margin);
      const openBelow = below >= height || below >= above;
      const availableHeight = openBelow ? below : above;

      popover.style.maxHeight = `${availableHeight}px`;
      const bounds = popover.getBoundingClientRect();
      popover.style.left = `${Math.max(margin, Math.min(anchor.right - bounds.width, window.innerWidth - bounds.width - margin))}px`;
      popover.style.top = `${Math.max(margin, Math.min(openBelow ? anchor.bottom + gap : anchor.top - gap - bounds.height, viewportHeight - bounds.height - margin))}px`;
    }

    positionPopover();
    const observer = new ResizeObserver(positionPopover);
    observer.observe(trigger);
    observer.observe(popover);
    window.addEventListener("resize", positionPopover);
    window.addEventListener("scroll", positionPopover, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", positionPopover);
      window.removeEventListener("scroll", positionPopover, true);
    };
  }, [isOpen, locale, fontSize]);

  return (
    <div className="accessibility-controls shrink-0">
      <button
        ref={triggerRef}
        type="button"
        className="pixel-chip min-h-11 min-w-11 shrink-0 justify-center p-2"
        popoverTarget={`${id}-popover`}
        aria-label={t("title")}
        title={t("title")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={`${id}-popover`}
      >
        <IoAccessibilityOutline aria-hidden="true" className="size-5" />
      </button>
      <div
        ref={popoverRef}
        id={`${id}-popover`}
        popover="auto"
        role="dialog"
        aria-labelledby={`${id}-title`}
        className="accessibility-popover pixel-panel gap-4 p-4"
        onToggle={(event) => setIsOpen(event.newState === "open")}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id={`${id}-title`} className="min-w-0 text-sm font-bold">
            {t("title")}
          </h2>
          <button
            type="button"
            className="pixel-chip min-h-11 min-w-11 shrink-0 justify-center p-2"
            popoverTarget={`${id}-popover`}
            popoverTargetAction="hide"
            aria-label={commonT("closeDialog")}
          >
            <IoClose aria-hidden="true" className="size-4" />
          </button>
        </div>
        <div
          className="grid gap-2 text-sm"
          role="group"
          aria-labelledby={`${id}-language`}
        >
          <p id={`${id}-language`}>{t("language")}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="pixel-chip min-h-11 justify-center px-3 text-xs"
              lang="th"
              aria-label={t("switchToThai")}
              aria-pressed={locale === "th"}
              onClick={() => setLocale("th")}
            >
              TH
            </button>
            <button
              type="button"
              className="pixel-chip min-h-11 justify-center px-3 text-xs"
              lang="en"
              aria-label={t("switchToEnglish")}
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
        </div>
        <div className="grid gap-2 text-sm">
          <label htmlFor={`${id}-size`}>{t("textSize")}</label>
          <select
            id={`${id}-size`}
            className="pixel-input w-full px-2 py-2"
            value={fontSize}
            onChange={(event) => setFontSize(event.target.value as FontSize)}
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {t(sizeLabels[size])}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2 text-sm">
          <label htmlFor={`${id}-theme`}>{t("contrastTheme")}</label>
          <select
            id={`${id}-theme`}
            className="pixel-input w-full px-2 py-2"
            value={colorTheme}
            onChange={(event) =>
              setColorTheme(event.target.value as ColorTheme)
            }
          >
            {colorThemes.map((theme) => (
              <option key={theme} value={theme}>
                {t(themeLabels[theme])}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="pixel-button-secondary min-h-10 px-3 text-xs"
          onClick={resetAppearance}
        >
          {t("reset")}
        </button>
      </div>
    </div>
  );
}
