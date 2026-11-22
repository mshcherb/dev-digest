/** FindingsCell — M1 FINDINGS column (counts per severity + keyboard-accessible popover). */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { PrFindings, PrFindingPreview } from "@devdigest/shared";
import messages from "../../../../../../../messages/en/prReview.json";
import { FindingsCell } from "./FindingsCell";

afterEach(cleanup);

function renderCell(findings: PrFindings | null | undefined) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <FindingsCell findings={findings} />
    </NextIntlClientProvider>,
  );
}

const item = (o: Partial<PrFindingPreview>): PrFindingPreview => ({
  id: Math.random().toString(36),
  severity: "WARNING",
  title: "Title",
  file: "src/a.ts",
  start_line: 1,
  confidence: 0.8,
  rationale: "Because.",
  ...o,
});

const SIX: PrFindings = {
  total: 6,
  counts: { CRITICAL: 2, WARNING: 2, SUGGESTION: 2 },
  preview: [
    item({ severity: "CRITICAL", title: "SQL injection", file: "src/db.ts", start_line: 42, confidence: 0.92 }),
    item({ severity: "CRITICAL", title: "Hardcoded secret" }),
    item({ severity: "WARNING", title: "Missing await" }),
    item({ severity: "WARNING", title: "N+1 query" }),
    item({ severity: "SUGGESTION", title: "Rename var" }),
  ],
};

describe("FindingsCell", () => {
  it("never-reviewed PR renders — (like COST)", () => {
    renderCell(null);
    expect(screen.getByTestId("pr-findings")).toHaveTextContent("—");
    renderCell(undefined);
    expect(screen.getAllByTestId("pr-findings")[1]).toHaveTextContent("—");
  });

  it("reviewed with nothing found renders a muted 0, no popover", () => {
    renderCell({ total: 0, counts: { CRITICAL: 0, WARNING: 0, SUGGESTION: 0 }, preview: [] });
    const cell = screen.getByTestId("pr-findings");
    expect(cell).toHaveTextContent("0");
    fireEvent.mouseEnter(cell);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows one badge per non-zero level, in severity order", () => {
    renderCell({ ...SIX, total: 3, counts: { CRITICAL: 1, WARNING: 0, SUGGESTION: 2 } });
    const levels = [...screen.getByTestId("pr-findings").querySelectorAll("[data-severity]")];
    expect(levels.map((e) => e.getAttribute("data-severity"))).toEqual(["CRITICAL", "SUGGESTION"]);
    expect(levels.map((e) => e.textContent)).toEqual(["1", "2"]);
  });

  it("focus opens the popover: title = cell total, CRITICAL first, path:line, +K more; Escape closes", () => {
    renderCell(SIX);
    const cell = screen.getByTestId("pr-findings");
    expect(cell).toHaveAttribute("tabindex", "0");
    expect(cell).toHaveAccessibleName("6 findings: 2 critical, 2 warning, 2 suggestion");

    fireEvent.focus(cell);
    const tip = screen.getByRole("tooltip");
    expect(cell).toHaveAttribute("aria-describedby", tip.id);
    expect(within(tip).getByText("6 findings")).toBeInTheDocument();

    const items = within(tip).getAllByTestId("pr-findings-item");
    expect(items).toHaveLength(5);
    expect(items[0]).toHaveTextContent("SQL injection");
    expect(items[0]).toHaveTextContent("src/db.ts:42");
    expect(items[0]).toHaveTextContent("92%");
    expect(within(tip).getByText("+1 more")).toBeInTheDocument();

    fireEvent.keyDown(cell, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("no +K more when the preview covers every finding; hover opens/closes", () => {
    renderCell({ total: 1, counts: { CRITICAL: 0, WARNING: 1, SUGGESTION: 0 }, preview: [item({})] });
    const cell = screen.getByTestId("pr-findings");
    fireEvent.mouseEnter(cell);
    expect(within(screen.getByRole("tooltip")).getByText("1 finding")).toBeInTheDocument();
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    fireEvent.mouseLeave(cell);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
