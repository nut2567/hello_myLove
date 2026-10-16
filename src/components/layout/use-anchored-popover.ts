"use client";

import { useEffect, useRef, useState } from "react";

export function useAnchoredPopover() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;

    function positionPopover() {
      if (!trigger || !popover) return;
      // Close a mobile popover when its trigger disappears at the desktop breakpoint.
      if (!trigger.getClientRects().length) {
        popover.hidePopover();
        return;
      }

      const margin = 16;
      const gap = 12;
      const anchor = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const height = Math.min(popover.scrollHeight + 8, viewportHeight - margin * 2);
      const below = Math.max(0, viewportHeight - margin - anchor.bottom - gap);
      const above = Math.max(0, anchor.top - gap - margin);
      const openBelow = below >= height || below >= above;

      popover.style.maxHeight = `${openBelow ? below : above}px`;
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
  }, [isOpen]);

  return { triggerRef, popoverRef, isOpen, setIsOpen };
}
