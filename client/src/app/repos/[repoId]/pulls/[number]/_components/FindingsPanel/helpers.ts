// Type-only: a value import pulls the vendor/shared barrel into the Next bundle,
// whose `./contracts/*.js` specifiers webpack cannot resolve to the `.ts` sources.
import type { FindingRecord, Severity } from "@devdigest/shared";
import { LOW_CONFIDENCE_THRESHOLD, SEVERITY_ORDER } from "./constants";

/** Optionally drop low-confidence findings and sort by severity. */
export function visibleFindings(findings: FindingRecord[], hideLow: boolean): FindingRecord[] {
  let shown = findings;
  if (hideLow) shown = shown.filter((f) => f.confidence >= LOW_CONFIDENCE_THRESHOLD);
  return [...shown].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
  );
}

/** The three severity levels shown as counters, in display order. */
export const SEVERITY_LEVELS = ["CRITICAL", "WARNING", "SUGGESTION"] as const satisfies readonly Severity[];

// Compile-time guard: fails typecheck if the Severity enum gains a level missing above.
type MissingSeverity = Exclude<Severity, (typeof SEVERITY_LEVELS)[number]>;
const _allSeveritiesListed: [MissingSeverity] extends [never] ? true : never = true;
void _allSeveritiesListed;

/** Count findings per severity; every level is present (0 when none). */
export function countBySeverity(findings: FindingRecord[]): Record<Severity, number> {
  const counts = Object.fromEntries(SEVERITY_LEVELS.map((s) => [s, 0])) as Record<Severity, number>;
  for (const f of findings) {
    // API responses are not zod-parsed: ignore unknown levels (e.g. legacy INFO).
    if (Object.hasOwn(counts, f.severity)) counts[f.severity] += 1;
  }
  return counts;
}

/** Keep only findings of `severity`; `null` means no severity filter. */
export function filterBySeverity(findings: FindingRecord[], severity: Severity | null): FindingRecord[] {
  return severity ? findings.filter((f) => f.severity === severity) : findings;
}
