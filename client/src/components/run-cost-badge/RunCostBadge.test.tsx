/** RunCostBadge — M1 run cost badge (inline + compact with per-run tooltip). */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { PrCost } from "@devdigest/shared";
import messages from "../../../messages/en/prReview.json";
import { RunCostBadge, type RunCostBadgeProps } from "./RunCostBadge";

afterEach(cleanup);

function renderBadge(props: RunCostBadgeProps) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <RunCostBadge {...props} />
    </NextIntlClientProvider>,
  );
}

const COST: PrCost = {
  total_usd: 0.0027,
  runs_count: 3,
  runs: [
    { run_id: "a", agent_name: "Security Reviewer", model: "deepseek-v4-flash", status: "done", ran_at: "2026-11-21T10:00:00Z", cost_usd: 0.0013 },
    { run_id: "b", agent_name: "Performance Reviewer", model: "deepseek-v4-flash", status: "done", ran_at: "2026-11-21T09:00:00Z", cost_usd: 0.0014 },
    { run_id: "c", agent_name: "General Reviewer", model: "gpt-4.1", status: "failed", ran_at: "2026-11-21T08:00:00Z", cost_usd: null },
  ],
};

describe("RunCostBadge inline", () => {
  it("total tokens + cost (timeline card)", () => {
    renderBadge({ variant: "inline", usd: 0.0013, tokensIn: 8000, tokensOut: 1119, tokens: "total" });
    expect(screen.getByTestId("run-cost")).toHaveTextContent("9,119 tok · $0.0013");
  });

  it("cost + token flow (verdict banner)", () => {
    renderBadge({ variant: "inline", usd: 0.014, tokensIn: 8200, tokensOut: 1300 });
    expect(screen.getByTestId("run-cost")).toHaveTextContent("$0.014 · 8.2K→1.3K");
  });

  it("unknown cost renders — (never $0.00)", () => {
    renderBadge({ variant: "inline", usd: null, tokensIn: 100, tokensOut: 50, tokens: "total" });
    expect(screen.getByTestId("run-cost")).toHaveTextContent("150 tok · —");
    expect(screen.queryByText(/\$0\.00/)).not.toBeInTheDocument();
  });
});

describe("RunCostBadge compact", () => {
  it("shows total and run count; tooltip lists every run on hover", () => {
    renderBadge({ variant: "compact", cost: COST });
    const badge = screen.getByTestId("pr-cost");
    expect(badge).toHaveTextContent("$0.0027 (3)");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.mouseEnter(badge);
    const tip = screen.getByRole("tooltip");
    expect(tip).toHaveTextContent("Security Reviewer");
    expect(tip).toHaveTextContent("$0.0013");
    expect(tip).toHaveTextContent("$0.0014");
    expect(tip).toHaveTextContent("General Reviewer");
    expect(tip).toHaveTextContent("—");
    expect(tip).toHaveTextContent("3 runs");

    fireEvent.mouseLeave(badge);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("tooltip opens on keyboard focus", () => {
    renderBadge({ variant: "compact", cost: COST });
    fireEvent.focus(screen.getByTestId("pr-cost"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("no runs → —", () => {
    renderBadge({ variant: "compact", cost: null });
    expect(screen.getByTestId("pr-cost")).toHaveTextContent("—");
  });

  it("all runs unknown → — with count", () => {
    renderBadge({ variant: "compact", cost: { total_usd: null, runs_count: 1, runs: [COST.runs[2]!] } });
    expect(screen.getByTestId("pr-cost")).toHaveTextContent("— (1)");
  });
});
