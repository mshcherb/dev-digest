import type { PrFindingPreview, PrFindings, Severity } from '@devdigest/shared';

/**
 * M1 — PR-list FINDINGS rollup (pure, unit-tested in `test/pulls-findings.test.ts`).
 *
 * Basis: the latest `done` run of EACH agent on the PR, summed. A failed or
 * cancelled newer run does not hide that agent's previous result (it wrote no
 * review). Runs whose agent was deleted (`agentId = null`) cannot be grouped
 * by agent and are skipped. Every finding counts, accepted/dismissed included —
 * the same number `agent_runs.findings_count` shows in the Agent runs timeline.
 */
export interface DoneRunRow {
  prId: string;
  agentId: string | null;
  runId: string;
}

export interface FindingRow {
  runId: string;
  id: string;
  severity: string;
  title: string;
  file: string;
  startLine: number;
  confidence: number;
  rationale: string;
}

export const PREVIEW_LIMIT = 5;
export const RATIONALE_MAX = 160;

const SEVERITY_RANK: Record<Severity, number> = { CRITICAL: 0, WARNING: 1, SUGGESTION: 2 };

function isSeverity(s: string): s is Severity {
  return s in SEVERITY_RANK;
}

/** Rows must be newest-first. Returns latest runId → prId, one per (PR, agent). */
export function pickLatestRunPerAgent(rows: DoneRunRow[]): Map<string, string> {
  const seen = new Set<string>();
  const latest = new Map<string, string>();
  for (const r of rows) {
    if (!r.agentId) continue;
    const key = `${r.prId}:${r.agentId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    latest.set(r.runId, r.prId);
  }
  return latest;
}

export function truncate(text: string, max = RATIONALE_MAX): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Every PR with a latest run gets an entry (`total: 0` when it found nothing).
 * Findings of runs outside `latestRuns` are ignored. Unknown severities are dropped.
 */
export function rollupFindings(
  latestRuns: Map<string, string>,
  rows: FindingRow[],
  previewLimit = PREVIEW_LIMIT,
): Map<string, PrFindings> {
  const all = new Map<string, (PrFindingPreview & { severity: Severity })[]>();
  for (const prId of latestRuns.values()) all.set(prId, []);

  for (const f of rows) {
    const prId = latestRuns.get(f.runId);
    if (!prId || !isSeverity(f.severity)) continue;
    all.get(prId)!.push({
      id: f.id,
      severity: f.severity,
      title: f.title,
      file: f.file,
      start_line: f.startLine,
      confidence: f.confidence,
      rationale: f.rationale,
    });
  }

  const out = new Map<string, PrFindings>();
  for (const [prId, list] of all) {
    const counts = { CRITICAL: 0, WARNING: 0, SUGGESTION: 0 };
    for (const f of list) counts[f.severity] += 1;
    const preview = [...list]
      .sort(
        (a, b) =>
          SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.confidence - a.confidence,
      )
      .slice(0, previewLimit)
      .map((f) => ({ ...f, rationale: truncate(f.rationale) }));
    out.set(prId, { total: list.length, counts, preview });
  }
  return out;
}
