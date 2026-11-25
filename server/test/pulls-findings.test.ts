/** M1 — PR-list FINDINGS rollup (`modules/pulls/findings.ts`). */
import { describe, it, expect } from 'vitest';
import {
  pickLatestRunPerAgent,
  rollupFindings,
  truncate,
  RATIONALE_MAX,
  type DoneRunRow,
  type FindingRow,
} from '../src/modules/pulls/findings.js';
import { PrMeta } from '../src/vendor/shared/index.js';

let seq = 0;
const f = (o: Partial<FindingRow>): FindingRow => ({
  runId: 'r1',
  id: `f${++seq}`,
  severity: 'WARNING',
  title: 'Something',
  file: 'src/a.ts',
  startLine: 10,
  confidence: 0.8,
  rationale: 'Because.',
  ...o,
});

describe('pickLatestRunPerAgent', () => {
  it('keeps the first (newest) run per PR × agent, skips agentless runs', () => {
    const rows: DoneRunRow[] = [
      { prId: 'pr1', agentId: 'sec', runId: 'sec-new' },
      { prId: 'pr1', agentId: 'gen', runId: 'gen-new' },
      { prId: 'pr1', agentId: 'sec', runId: 'sec-old' },
      { prId: 'pr1', agentId: null, runId: 'orphan' },
      { prId: 'pr2', agentId: 'sec', runId: 'pr2-sec' },
    ];
    expect([...pickLatestRunPerAgent(rows)]).toEqual([
      ['sec-new', 'pr1'],
      ['gen-new', 'pr1'],
      ['pr2-sec', 'pr2'],
    ]);
  });
});

describe('rollupFindings', () => {
  const latest = new Map([
    ['sec-new', 'pr1'],
    ['gen-new', 'pr1'],
    ['empty', 'pr2'],
  ]);

  it('sums the latest run of each agent and ignores older runs', () => {
    const m = rollupFindings(latest, [
      f({ runId: 'sec-new', severity: 'CRITICAL' }),
      f({ runId: 'sec-new', severity: 'WARNING' }),
      f({ runId: 'gen-new', severity: 'SUGGESTION' }),
      f({ runId: 'gen-new', severity: 'CRITICAL' }),
      f({ runId: 'sec-old', severity: 'CRITICAL' }),
    ]);
    const pr1 = m.get('pr1')!;
    expect(pr1.total).toBe(4);
    expect(pr1.counts).toEqual({ CRITICAL: 2, WARNING: 1, SUGGESTION: 1 });
  });

  it('a latest run with no findings yields total 0; PRs without runs get no entry', () => {
    const m = rollupFindings(latest, []);
    expect(m.get('pr2')).toEqual({
      total: 0,
      counts: { CRITICAL: 0, WARNING: 0, SUGGESTION: 0 },
      preview: [],
    });
    expect(m.has('pr3')).toBe(false);
  });

  it('preview: CRITICAL first, then confidence desc, capped', () => {
    const m = rollupFindings(
      latest,
      [
        f({ runId: 'sec-new', severity: 'SUGGESTION', confidence: 0.99, title: 's' }),
        f({ runId: 'sec-new', severity: 'WARNING', confidence: 0.5, title: 'w-low' }),
        f({ runId: 'gen-new', severity: 'WARNING', confidence: 0.9, title: 'w-high' }),
        f({ runId: 'gen-new', severity: 'CRITICAL', confidence: 0.6, title: 'c' }),
      ],
      3,
    );
    const pr1 = m.get('pr1')!;
    expect(pr1.total).toBe(4);
    expect(pr1.preview.map((p) => p.title)).toEqual(['c', 'w-high', 'w-low']);
    expect(pr1.preview[0]).toMatchObject({ file: 'src/a.ts', start_line: 10, confidence: 0.6 });
  });

  it('drops unknown severities and truncates long rationales', () => {
    const long = 'x'.repeat(400);
    const m = rollupFindings(latest, [
      f({ runId: 'sec-new', severity: 'INFO' }),
      f({ runId: 'sec-new', severity: 'CRITICAL', rationale: long }),
    ]);
    const pr1 = m.get('pr1')!;
    expect(pr1.total).toBe(1);
    expect(pr1.preview[0]!.rationale.length).toBe(RATIONALE_MAX);
    expect(pr1.preview[0]!.rationale.endsWith('…')).toBe(true);
  });

  it('output parses as PrMeta.findings', () => {
    const findings = rollupFindings(latest, [f({ runId: 'sec-new' })]).get('pr1')!;
    const meta = {
      number: 1,
      title: 't',
      author: 'a',
      branch: 'b',
      base: 'main',
      head_sha: 'abc',
      additions: 0,
      deletions: 0,
      files_count: 0,
      status: 'reviewed',
    };
    expect(PrMeta.parse({ ...meta, findings }).findings).toEqual(findings);
    expect(PrMeta.parse({ ...meta, findings: null }).findings).toBeNull();
    expect(PrMeta.parse(meta).findings).toBeUndefined();
  });
});

describe('truncate', () => {
  it('leaves short text alone', () => {
    expect(truncate('  short  ')).toBe('short');
  });
});
