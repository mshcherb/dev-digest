import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord } from "@devdigest/shared";
import messages from "../../../../../../../../messages/en/prReview.json";

// One shared mutate so assertions see the calls made by the component.
const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("../../../../../../../lib/hooks/reviews", () => ({
  useFindingAction: () => ({ mutate, isPending: false }),
}));

import { FindingsPanel } from "./FindingsPanel";

beforeEach(() => mutate.mockClear());
afterEach(cleanup);

const make = (
  id: string,
  severity: FindingRecord["severity"],
  title: string,
  confidence = 0.95,
): FindingRecord => ({
  id,
  severity,
  category: "security",
  title,
  file: "src/config.ts",
  start_line: 11,
  end_line: 11,
  rationale: "A secret is committed.",
  suggestion: null,
  confidence,
  kind: "finding",
  trifecta_components: null,
  evidence: null,
  review_id: "r1",
  accepted_at: null,
  dismissed_at: null,
});

const FINDINGS: FindingRecord[] = [make("f1", "CRITICAL", "Hardcoded secret")];

// 2 CRITICAL (one low-confidence) · 2 WARNING · 0 SUGGESTION
const MIXED: FindingRecord[] = [
  make("c1", "CRITICAL", "Hardcoded secret"),
  make("c2", "CRITICAL", "Maybe SQL injection", 0.4),
  make("w1", "WARNING", "Missing null check"),
  make("w2", "WARNING", "Unbounded retry"),
];

function renderWithIntl(ui: React.ReactElement) {
  const wrap = (node: React.ReactElement) => (
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {node}
    </NextIntlClientProvider>
  );
  const r = render(wrap(ui));
  return { ...r, rerender: (next: React.ReactElement) => r.rerender(wrap(next)) };
}

const counters = () => screen.getByRole("group", { name: "Filter findings by severity" });
const level = (name: "CRITICAL" | "WARNING" | "SUGGESTION") =>
  within(counters()).getByRole("button", { name: new RegExp(`${name}$`) });
const cardTitles = () =>
  ["Hardcoded secret", "Maybe SQL injection", "Missing null check", "Unbounded retry"].filter(
    (t) => screen.queryByText(t) !== null,
  );

describe("FindingsPanel (smoke)", () => {
  it("renders the toolbar + a finding card", () => {
    renderWithIntl(<FindingsPanel findings={FINDINGS} prId="pr1" />);
    expect(screen.getByText("Hide low confidence")).toBeInTheDocument();
    expect(screen.getByText("Hardcoded secret")).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", () => {
    renderWithIntl(<FindingsPanel findings={[]} prId="pr1" />);
    expect(screen.getByText("No findings match")).toBeInTheDocument();
  });
});

describe("FindingsPanel severity counters", () => {
  it("shows a count per level, including 0, with labels from messages", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    expect(level("CRITICAL")).toHaveAccessibleName("2 CRITICAL");
    expect(level("WARNING")).toHaveAccessibleName("2 WARNING");
    expect(level("SUGGESTION")).toHaveAccessibleName("0 SUGGESTION");
    expect(within(counters()).queryAllByRole("button", { pressed: true })).toHaveLength(0);
  });

  it("filters to a level on click and restores the full list on a second click", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    fireEvent.click(level("WARNING"));
    expect(cardTitles()).toEqual(["Missing null check", "Unbounded retry"]);
    expect(level("WARNING")).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(level("WARNING"));
    expect(cardTitles()).toHaveLength(4);
    expect(within(counters()).queryAllByRole("button", { pressed: true })).toHaveLength(0);
  });

  it("moves the highlight to another level: exactly one active, in its SEV color, others dimmed", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    fireEvent.click(level("WARNING"));
    fireEvent.click(level("CRITICAL"));

    const pressed = within(counters()).getAllByRole("button", { pressed: true });
    expect(pressed).toEqual([level("CRITICAL")]);
    expect(level("CRITICAL").getAttribute("style")).toContain("var(--crit)");
    expect(level("CRITICAL").style.opacity).toBe("1");
    // The previously active level loses its colored border (regression: shorthand/longhand mix).
    expect(level("WARNING").style.borderColor).toBe("transparent");
    expect(level("WARNING").style.opacity).toBe("0.5");
    expect(level("SUGGESTION").style.opacity).toBe("0.5");
    expect(cardTitles()).toEqual(["Hardcoded secret", "Maybe SQL injection"]);
  });

  it("works together with Hide low confidence (counts and list)", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    fireEvent.click(level("CRITICAL"));
    fireEvent.click(screen.getByRole("switch"));

    expect(level("CRITICAL")).toHaveAccessibleName("1 CRITICAL");
    expect(cardTitles()).toEqual(["Hardcoded secret"]);
  });

  it("shows the existing empty state when the level has no findings", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    fireEvent.click(level("SUGGESTION"));
    expect(screen.getByText("No findings match")).toBeInTheDocument();
    expect(cardTitles()).toHaveLength(0);
  });

  it("expands the first card of the new list after a filter change", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    // Only the first card is expanded, so its rationale is the only one shown.
    expect(screen.getAllByText("A secret is committed.")).toHaveLength(1);
    fireEvent.click(level("WARNING"));
    expect(screen.getAllByText("A secret is committed.")).toHaveLength(1);
  });

  it("keyboard actions target the filtered list", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    fireEvent.click(level("WARNING"));
    fireEvent.keyDown(window, { key: "a" });
    expect(mutate).toHaveBeenCalledWith({ findingId: "w1", action: "accept", prId: "pr1" });
  });

  it("stays in sync after accept/dismiss refetch without a reload", () => {
    const { rerender } = renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    fireEvent.click(level("WARNING"));

    // What the refetch after accept/dismiss delivers: same findings, new timestamps.
    const refetched = MIXED.map((f) =>
      f.id === "w1" ? { ...f, dismissed_at: "2026-11-21T10:00:00Z" } : f.id === "c1" ? { ...f, accepted_at: "2026-11-21T10:00:00Z" } : f,
    );
    rerender(<FindingsPanel findings={refetched} prId="pr1" />);

    expect(level("CRITICAL")).toHaveAccessibleName("2 CRITICAL");
    expect(level("WARNING")).toHaveAccessibleName("2 WARNING");
    expect(level("WARNING")).toHaveAttribute("aria-pressed", "true");
    expect(cardTitles()).toEqual(["Missing null check", "Unbounded retry"]);

    // A finding leaving the run (e.g. re-run replaced it) is reflected immediately.
    rerender(<FindingsPanel findings={refetched.filter((f) => f.id !== "w2")} prId="pr1" />);
    expect(level("WARNING")).toHaveAccessibleName("1 WARNING");
    expect(cardTitles()).toEqual(["Missing null check"]);
  });
});
