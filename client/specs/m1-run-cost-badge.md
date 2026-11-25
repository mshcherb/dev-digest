# M1 — Run cost badge

## Goal
Every finished agent run shows what it cost (USD) and how many tokens it used; every PR shows
the total spent on reviewing it. Zero extra model calls: data comes from the `usage` the LLM
provider already returns.

## Scope
**In**
| # | Screen | Shows |
|---|---|---|
| 1 | PR list → new `COST` column | `$0.014 (3)` = sum of all runs + run count; hover/focus → tooltip listing each run (agent · model · time · cost) |
| 2 | PR detail → Agent runs timeline card, right column under the time | `9,119 tok · $0.0013` |
| 3 | Run trace drawer → Stats → new `COST` tile next to Duration / Tokens / Findings | `$0.0013` |
| 4 | Verdict banner (inside a review run) | `$0.014 · 8.2K→1.3K` |

**Out**: backfilling cost for runs made before this feature; budgets/alerts; per-workspace totals
(Agent Performance / Eval dashboards are later milestones).

## Decisions
- Cost source: provider-reported cost (OpenRouter `usage.cost`), else tokens × price book
  (`server/src/platform/price-book.ts`), else `null` (unknown model).
- Stored once, at run completion (`agent_runs.cost_usd`). Old runs and failed runs → `null`.
- `null` renders as **«—»**, never `$0.00`.
- PR total = sum of runs with known cost; runs with `null` are counted in `(n)` and shown as «—»
  in the tooltip. All runs unknown → «—».

## Formatting (`src/lib/format.ts`)
- USD: `< $0.01` → 4 decimals (`$0.0013`), `< $1` → 3 (`$0.014`), otherwise 2 (`$1.20`).
- Tokens compact: `<1000` as is, then `8.2K`, `1.2M`. Token flow: `8.2K→1.3K`.

## Design
- Contracts (both `vendor/shared` copies): `RunStats.cost_usd`, `RunSummary.cost_usd`,
  `PrMeta.cost: { total_usd, runs_count, runs: PrRunCost[] }`.
- Component `src/components/RunCostBadge/` with variants `compact` (PR list, with tooltip) and
  `inline` (timeline card, verdict banner). The drawer tile uses `formatUsd` inside `Stat`.

## Acceptance
- A new completed run shows cost in all 4 places without a page reload.
- Error / cancelled / pre-feature runs show «—».
- Unit tests: formatters, `RunCostBadge`, `RunHistory`, `RunTraceDrawer`, `VerdictBanner`.

## Status
in progress
