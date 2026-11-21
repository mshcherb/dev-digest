import { describe, it, expect } from "vitest";
import { formatUsd, formatTokensCompact, formatTokenFlow, formatTokensTotal } from "./format";

describe("formatUsd", () => {
  it("null/undefined → em dash, never $0.00", () => {
    expect(formatUsd(null)).toBe("—");
    expect(formatUsd(undefined)).toBe("—");
  });
  it("picks precision by magnitude", () => {
    expect(formatUsd(0.0013)).toBe("$0.0013");
    expect(formatUsd(0.014)).toBe("$0.014");
    expect(formatUsd(0.06)).toBe("$0.060");
    expect(formatUsd(1.2)).toBe("$1.20");
    expect(formatUsd(0)).toBe("$0.00");
  });
});

describe("token formatters", () => {
  it("compacts", () => {
    expect(formatTokensCompact(950)).toBe("950");
    expect(formatTokensCompact(8200)).toBe("8.2K");
    expect(formatTokensCompact(1000)).toBe("1K");
    expect(formatTokensCompact(15000)).toBe("15K");
    expect(formatTokensCompact(1_234_567)).toBe("1.2M");
  });
  it("flow and total", () => {
    expect(formatTokenFlow(8200, 1300)).toBe("8.2K→1.3K");
    expect(formatTokenFlow(null, 1)).toBe("—");
    expect(formatTokensTotal(8000, 1119)).toBe("9,119 tok");
    expect(formatTokensTotal(null, null)).toBe("—");
  });
});
