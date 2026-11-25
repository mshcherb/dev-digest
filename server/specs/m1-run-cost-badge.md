# M1 — Run cost badge (server)

UI spec: `client/specs/m1-run-cost-badge.md`.

## Goal
Persist each agent run's cost and expose it on the existing GET routes. No extra LLM calls.

## Design
- `agent_runs.cost_usd double precision NULL` (new migration; 0009 dropped the old column).
- `run-executor.ts` stores `ReviewOutcome.costUsd` (provider cost → price-book estimate → null)
  in the row and in `trace.stats.cost_usd`; failure paths store `null`. The "agent finished" log
  line includes `tokensIn`, `tokensOut`, `costUsd`.
- `GET /pulls/:id/runs` → `RunSummary.cost_usd`; `GET /runs/:id/trace` → `stats.cost_usd`.
- `GET /repos/:id/pulls` → `PrMeta.cost = { total_usd, runs_count, runs[] }`: one IN-query over
  `agent_runs` (excluding `running`) joined to `agents` for the name, grouped in JS
  (same pattern as the latest-score lookup).

## Acceptance
- Contract test parses `RunTrace` / `RunSummary` / `PrMeta` with cost.
- Aggregation unit test: sum, partial (some `null`), all `null` → `total_usd: null`, no runs → `null`.

## Status
in progress
