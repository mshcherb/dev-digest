/* AnchoredPopover — a tooltip/popover rendered in a portal on document.body with
   position: fixed, so ancestors with overflow: hidden (e.g. the PR list's
   tableCard) cannot clip it. Positioned from the anchor's bounding rect; flips
   above when there is no room below, and scrolls inside when it fits nowhere. Repositions on scroll and resize while open.
   React events still bubble through the portal to the anchor's React parents, so
   callers keep onClick={e => e.stopPropagation()} when the anchor sits in a link row. */
"use client";

import React from "react";
import { createPortal } from "react-dom";
import { computePlacement, type Align, type Placement } from "./placement";

type Props = Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> & {
  anchorRef: React.RefObject<HTMLElement | null>;
  align?: Align;
  gap?: number;
  style?: React.CSSProperties;
};

export function AnchoredPopover({ anchorRef, align = "start", gap = 6, style, children, ...rest }: Props) {
  const popRef = React.useRef<HTMLSpanElement>(null);
  const [placement, setPlacement] = React.useState<Placement | null>(null);

  const update = React.useCallback(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    setPlacement(
      computePlacement(
        anchor.getBoundingClientRect(),
        // scrollHeight = natural content height, unaffected by our own maxHeight cap.
        { width: pop.offsetWidth, height: pop.scrollHeight },
        { width: window.innerWidth, height: window.innerHeight },
        align,
        gap,
      ),
    );
  }, [anchorRef, align, gap]);

  React.useLayoutEffect(() => {
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <span
      ref={popRef}
      data-side={placement?.side}
      {...rest}
      style={{
        ...style,
        position: "fixed",
        top: placement?.top ?? 0,
        left: placement?.left ?? 0,
        maxHeight: placement?.maxHeight,
        overflowY: "auto",
        zIndex: 1000,
        // Measured first, then shown — avoids a one-frame flash at (0, 0).
        visibility: placement ? "visible" : "hidden",
      }}
    >
      {children}
    </span>,
    document.body,
  );
}
