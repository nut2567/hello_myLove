"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { IoClose, IoMenuOutline } from "react-icons/io5";

import { useAnchoredPopover } from "@/components/layout/use-anchored-popover";

const navigationItems = [
  { href: "/th/structure", label: "structure" },
  { href: "/th/heart", label: "heart" },
  { href: "/th/heart/leaderboard", label: "heartLeaderboard" },
  { href: "/th/logo", label: "logo" },
  { href: "/th/RobotDragGame", label: "robotGame" },
] as const;

export function SiteNavigationLinks({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const t = useTranslations("Navigation");

  return navigationItems.map(({ href, label }) => (
    <Link
      key={href}
      className={mobile ? "pixel-shell-link pixel-chip min-h-11 px-3 py-3 text-sm" : "pixel-shell-link"}
      href={href}
      prefetch={label === "heartLeaderboard" ? false : undefined}
      onNavigate={onNavigate}
    >
      {t(label)}
    </Link>
  ));
}

export function MobileNavigation() {
  const id = useId();
  const t = useTranslations("Navigation");
  const commonT = useTranslations("Common");
  const { triggerRef, popoverRef, isOpen, setIsOpen } = useAnchoredPopover();

  return (
    <div className="mobile-navigation shrink-0 lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="pixel-chip min-h-11 min-w-11 shrink-0 justify-center p-2"
        popoverTarget={`${id}-navigation`}
        aria-label={t("primary")}
        title={t("primary")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={`${id}-navigation`}
      >
        <IoMenuOutline aria-hidden="true" className="size-5" />
      </button>
      <div
        ref={popoverRef}
        id={`${id}-navigation`}
        popover="auto"
        role="dialog"
        aria-labelledby={`${id}-title`}
        className="mobile-navigation-popover pixel-panel gap-4 p-4"
        onToggle={(event) => setIsOpen(event.newState === "open")}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id={`${id}-title`} className="min-w-0 text-sm font-bold">
            {t("primary")}
          </h2>
          <button
            type="button"
            className="pixel-chip min-h-11 min-w-11 shrink-0 justify-center p-2"
            popoverTarget={`${id}-navigation`}
            popoverTargetAction="hide"
            aria-label={commonT("closeDialog")}
          >
            <IoClose aria-hidden="true" className="size-4" />
          </button>
        </div>
        <nav className="grid gap-2" aria-label={t("primary")}>
          <SiteNavigationLinks mobile onNavigate={() => popoverRef.current?.hidePopover()} />
        </nav>
      </div>
    </div>
  );
}
