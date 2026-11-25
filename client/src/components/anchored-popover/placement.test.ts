/** AnchoredPopover placement — opens below, flips above near the bottom, stays in the viewport. */
import { describe, it, expect } from "vitest";
import { computePlacement, VIEWPORT_MARGIN } from "./placement";

const VIEWPORT = { width: 1200, height: 800 };
const POP = { width: 360, height: 200 };
const rect = (top: number, left: number, h = 20, w = 60) => ({ top, bottom: top + h, left, right: left + w });

describe("computePlacement", () => {
  it("opens below the anchor, left-aligned, when there is room", () => {
    expect(computePlacement(rect(100, 400), POP, VIEWPORT)).toEqual({
      top: 126,
      left: 400,
      side: "below",
      maxHeight: 800 - 120 - 6 - VIEWPORT_MARGIN,
    });
  });

  it("flips above when the anchor is near the bottom (last row of the list)", () => {
    const p = computePlacement(rect(700, 400), POP, VIEWPORT);
    expect(p.side).toBe("above");
    expect(p.top).toBe(700 - 6 - 200);
  });

  it("fits on neither side (one-PR list, short window): picks the roomier side and caps the height", () => {
    const p = computePlacement(rect(300, 400), { width: 360, height: 700 }, VIEWPORT);
    expect(p.side).toBe("below");
    expect(p.top).toBe(326);
    expect(p.top + p.maxHeight).toBe(800 - VIEWPORT_MARGIN);
  });

  it("end-aligns right edges and clamps inside the viewport", () => {
    expect(computePlacement(rect(100, 1000, 20, 80), POP, VIEWPORT, "end").left).toBe(1080 - 360);
    expect(computePlacement(rect(100, 1100), POP, VIEWPORT).left).toBe(1200 - 360 - VIEWPORT_MARGIN);
    expect(computePlacement(rect(100, 0, 20, 40), POP, VIEWPORT, "end").left).toBe(VIEWPORT_MARGIN);
  });

  it("never places an above-popover past the top edge", () => {
    const p = computePlacement(rect(150, 400), { width: 360, height: 600 }, { width: 1200, height: 300 });
    expect(p.side).toBe("above");
    expect(p.top).toBe(VIEWPORT_MARGIN);
    expect(p.top + p.maxHeight).toBe(150 - 6);
  });
});
