/** M1 — PR-list COST rollup (`modules/pulls/cost.ts`). */
import { describe, it, expect } from 'vitest';
import { rollupRunCosts, type RunCostRow } from '../src/modules/pulls/cost.js';
import { PrMeta } from '../src/vendor/shared/index.js';

const row = (o: Partial<RunCostRow>): RunCostRow => ({
  prId: 'pr1',
  runId: 'r1',
  agentName: 'Security Reviewer',
  model: 'deepseek-v4-flash',
  status: 'done',
  ranAt: new Date('2026-11-21T10:00:00Z'),
  costUsd: 0.001,
  ...o,
});

describe('rollupRunCosts', () => {
  it('sums known costs, counts every run, keeps newest-first order', () => {
    const m = rollupRunCosts([
      row({ runId: 'a', costUsd: 0.0013 }),
      row({ runId: 'b', costUsd: 0.0014 }),
      row({ runId: 'c', prId: 'pr2', costUsd: 0.5 }),
    ]);
    const pr1 = m.get('pr1')!;
    expect(pr1.runs_count).toBe(2);
    expect(pr1.total_usd).toBeCloseTo(0.0027);
    expect(pr1.runs.map((r) => r.run_id)).toEqual(['a', 'b']);
    expect(pr1.runs[0]!.ran_at).toBe('2026-11-21T10:00:00.000Z');
    expect(m.get('pr2')!.total_usd).toBe(0.5);
  });

  it('partial: unknown runs are counted and listed but not summed as 0', () => {
    const pr = rollupRunCosts([row({ runId: 'a', costUsd: null, status: 'failed' }), row({ runId: 'b', costUsd: 0.002 })]).get('pr1')!;
    expect(pr.runs_count).toBe(2);
    expect(pr.total_usd).toBe(0.002);
    expect(pr.runs[0]!.cost_usd).toBeNull();
  });

  it('all unknown → total_usd null (UI shows "—", not $0.00)', () => {
    const pr = rollupRunCosts([row({ costUsd: null }), row({ runId: 'b', costUsd: null })]).get('pr1')!;
    expect(pr.total_usd).toBeNull();
    expect(pr.runs_count).toBe(2);
  });

  it('no runs → PR absent from the map', () => {
    expect(rollupRunCosts([]).size).toBe(0);
  });

  it('output parses as PrMeta.cost', () => {
    const cost = rollupRunCosts([row({})]).get('pr1')!;
    expect(() =>
      PrMeta.parse({
        number: 1, title: 't', author: 'a', branch: 'b', base: 'main', head_sha: 'x',
        additions: 1, deletions: 0, files_count: 1, status: 'reviewed', cost,
      }),
    ).not.toThrow();
  });
});
