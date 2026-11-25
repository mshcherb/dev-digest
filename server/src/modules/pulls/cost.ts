import type { PrCost } from '@devdigest/shared';

/**
 * M1 — PR-list COST rollup (pure, unit-tested in `test/pulls-cost.test.ts`).
 *
 * One row per finished agent run of a PR. The total sums only runs with a
 * known cost; runs with `cost_usd = null` (failed runs, unknown model price,
 * runs made before cost was stored) still count in `runs_count` and are listed
 * so the tooltip can show them as "—". Never coerce unknown cost to 0.
 */
export interface RunCostRow {
  prId: string;
  runId: string;
  agentName: string | null;
  model: string | null;
  status: string | null;
  ranAt: Date | null;
  costUsd: number | null;
}

/** Rows must be newest-first; the per-PR run lists keep that order. */
export function rollupRunCosts(rows: RunCostRow[]): Map<string, PrCost> {
  const byPr = new Map<string, PrCost>();
  for (const r of rows) {
    let acc = byPr.get(r.prId);
    if (!acc) {
      acc = { total_usd: null, runs_count: 0, runs: [] };
      byPr.set(r.prId, acc);
    }
    acc.runs_count += 1;
    if (r.costUsd != null) acc.total_usd = (acc.total_usd ?? 0) + r.costUsd;
    acc.runs.push({
      run_id: r.runId,
      agent_name: r.agentName,
      model: r.model,
      status: r.status,
      ran_at: r.ranAt ? r.ranAt.toISOString() : null,
      cost_usd: r.costUsd,
    });
  }
  return byPr;
}
