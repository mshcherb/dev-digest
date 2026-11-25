/** Pure placement math for AnchoredPopover (unit-tested in `placement.test.ts`). */
export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Align = "start" | "end";

export interface Placement {
  top: number;
  left: number;
  side: "below" | "above";
  /** Room on the chosen side; the popover scrolls inside it when taller. */
  maxHeight: number;
}

/** Keeps the popover this far from the viewport edge. */
export const VIEWPORT_MARGIN = 8;

/**
 * Fixed-position coordinates for a popover anchored to `anchor`.
 * Opens below; flips above when it does not fit below and there is more room
 * above. `align: "start"` lines up left edges, `"end"` right edges. The result
 * is clamped so the popover stays inside the viewport horizontally; when it fits
 * on neither side, `maxHeight` caps it to the room on the chosen side.
 */
export function computePlacement(
  anchor: Rect,
  pop: Size,
  viewport: Size,
  align: Align = "start",
  gap = 6,
): Placement {
  const spaceBelow = viewport.height - anchor.bottom - gap - VIEWPORT_MARGIN;
  const spaceAbove = anchor.top - gap - VIEWPORT_MARGIN;
  const side = pop.height > spaceBelow && spaceAbove > spaceBelow ? "above" : "below";
  const maxHeight = Math.max(0, side === "below" ? spaceBelow : spaceAbove);
  const height = Math.min(pop.height, maxHeight);
  const top = side === "below" ? anchor.bottom + gap : anchor.top - gap - height;

  const rawLeft = align === "start" ? anchor.left : anchor.right - pop.width;
  const maxLeft = viewport.width - pop.width - VIEWPORT_MARGIN;
  const left = Math.max(VIEWPORT_MARGIN, Math.min(rawLeft, maxLeft));
  return { top, left, side, maxHeight };
}
