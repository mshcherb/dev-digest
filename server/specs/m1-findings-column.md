# M1 — FINDINGS column in the PR list (server)

UI spec: `client/specs/m1-findings-column.md`.

## Goal
`GET /repos/:id/pulls` returns, per PR, a findings rollup for the list's FINDINGS column:
per-severity counts and a short preview. Read-only aggregation: no new tables, no migrations,
no model calls.

## Design
- **Basis = latest `done` run of each agent on the PR, summed.** `agent_runs` with
  `status='done'`, `agent_id IS NOT NULL`, that still have a `kind='review'` row
  (inner join `reviews.run_id = agent_runs.id`), newest `ran_at` first; the first run seen per
  `(pr_id, agent_id)` wins. After `DELETE /reviews/:id` the agent falls back to its previous
  reviewed run; a PR whose only review was deleted gets `null` («—»), not `total: 0`. A failed/cancelled newest run does not hide that agent's previous
  result. Runs whose agent was deleted (`agent_id = null`) are skipped.
- Path: run → `reviews.run_id` (`kind='review'`) → `findings.review_id`. All findings count,
  accepted/dismissed included (same as `agent_runs.findings_count` in the Agent runs timeline).
- Contract (both `vendor/shared` copies, `contracts/platform.ts`):
  `PrMeta.findings: PrFindings | null` with
  `PrFindings = { total, counts: { CRITICAL, WARNING, SUGGESTION }, preview: PrFindingPreview[] }`,
  `PrFindingPreview = { id, severity, title, file, start_line, confidence, rationale }`.
  `null` = PR has no done run with a review; `total: 0` = reviewed, nothing found.
- Preview: sorted CRITICAL → WARNING → SUGGESTION, then confidence desc; at most 5;
  `rationale` truncated to 160 chars with «…». `total - preview.length` = «+K more».
- Route: two IN-queries (latest runs, then findings ⋈ reviews for those run ids) + JS grouping,
  same pattern as score/cost. Pure logic in `src/modules/pulls/findings.ts`
  (`pickLatestRunPerAgent`, `rollupFindings`).

## Acceptance
- Unit test `test/pulls-findings.test.ts`: latest per agent across two agents, older runs ignored,
  null agent skipped, zero findings → `total: 0`, counts, preview order/cap/truncation, several PRs.
- Integration test `test/pulls-findings.it.test.ts`: deleting the newest review falls back to the
  previous run (3, not 0); deleting the only review → `findings: null`.
- Contract test parses `PrMeta` with and without `findings`.
- `pnpm test` and `pnpm typecheck` green.

## Status
done
