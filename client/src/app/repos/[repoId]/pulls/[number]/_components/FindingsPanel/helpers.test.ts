import { describe, it, expect } from "vitest";
import type { FindingRecord } from "@devdigest/shared";
import { countBySeverity, filterBySeverity, visibleFindings } from "./helpers";

const make = (id: string, severity: FindingRecord["severity"], confidence = 0.9): FindingRecord => ({
  id,
  severity,
  category: "bug",
  title: `Finding ${id}`,
  file: "src/a.ts",
  start_line: 1,
  end_line: 1,
  rationale: "r",
  suggestion: null,
  confidence,
  kind: "finding",
  trifecta_components: null,
  evidence: null,
  review_id: "r1",
  accepted_at: null,
  dismissed_at: null,
});

describe("countBySeverity", () => {
  it("returns all three levels with zeros for an empty list", () => {
    expect(countBySeverity([])).toEqual({ CRITICAL: 0, WARNING: 0, SUGGESTION: 0 });
  });

  it("counts mixed severities", () => {
    const list = [make("a", "CRITICAL"), make("b", "WARNING"), make("c", "CRITICAL")];
    expect(countBySeverity(list)).toEqual({ CRITICAL: 2, WARNING: 1, SUGGESTION: 0 });
  });
});

describe("countBySeverity with unexpected input", () => {
  it("ignores unknown levels and prototype keys", () => {
    const odd = [make("a", "INFO" as never), make("b", "toString" as never), make("c", "WARNING")];
    expect(countBySeverity(odd)).toEqual({ CRITICAL: 0, WARNING: 1, SUGGESTION: 0 });
  });
});

describe("filterBySeverity", () => {
  const list = [make("a", "CRITICAL"), make("b", "WARNING"), make("c", "SUGGESTION")];

  it("passes the list through when severity is null", () => {
    expect(filterBySeverity(list, null)).toBe(list);
  });

  it("keeps only the requested level", () => {
    expect(filterBySeverity(list, "WARNING").map((f) => f.id)).toEqual(["b"]);
  });

  it("combines with hide-low-confidence", () => {
    const withLow = [...list, make("d", "WARNING", 0.3)];
    const shown = filterBySeverity(visibleFindings(withLow, true), "WARNING");
    expect(shown.map((f) => f.id)).toEqual(["b"]);
  });
});
