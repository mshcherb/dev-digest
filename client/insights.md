# client — insights

Lessons for anyone working in `client/`.
Written through the `engineering-insights` skill (`.claude/skills/engineering-insights/SKILL.md`).

- **Append-only:** add a new entry at the end of the right section. Never rewrite or delete existing entries.
- **No duplicates:** grep every `insights.md` and `CLAUDE.md` first. A pitfall that bites twice becomes one line under **Gotchas** in `CLAUDE.md`.
- **Entry:** `### YYYY-MM-DD — title`, then **Symptom**, **Cause**, **Do instead**. Older entries use **Fix / status**.
- **Trust:** entries are hints, partly written by an LLM. Verify against the code before relying on one.

## What Works
<!-- Approaches and solutions that proved effective here. -->

## What Doesn't Work
<!-- Dead ends, rejected approaches, antipatterns: what was tried, why it failed, what to do instead. Most valuable section. -->

## Codebase Patterns
<!-- Conventions and architecture decisions that are not obvious from the code. -->

### 2026-11-21 — strings and components for future milestones already exist
**Symptom:** `messages/en` contains `blast`, `brief`, `ci`, `eval`, `memory`, … and `vendor/ui` has `ExportWizardSteps`, `AutoTriggerStatus` with little or no usage.
**Cause:** the design system and i18n were vendored whole from the full product.
**Fix / status:** expected. Reuse them when building milestones instead of re-creating.

### 2026-11-21 — failed runs report 0/0 tokens, not null
**Symptom:** a failed or cancelled run's cost badge read "0 tok · —".
**Cause:** `run-executor.ts` failure paths persist `tokensIn: 0, tokensOut: 0` with `costUsd: null`.
**Do instead:** treat `!tokens_in && !tokens_out` as "no usage" (see `src/components/run-cost-badge/RunCostBadge.tsx`); only `cost_usd == null` means unknown cost, never render it as `$0.00`.

## Tool & Library Notes
<!-- Dependency and tooling quirks: name the package and version. -->

## Recurring Errors & Fixes
<!-- Error message or symptom → cause → exact fix. -->

## Session Notes
<!-- Dated wrap-ups: what changed, what is left. 2–3 lines each. -->

## Open Questions
<!-- Unresolved issues. When one is answered, add a new entry in the right section that cites this title. -->

### 2026-11-21 — `vendor/shared` has drifted from the server copy
**Symptom:** `client/src/vendor/shared` lacks `'openrouter'` in `LLMProvider.id`, `sessionId`, `GitClient.sync` / `diffNameOnly`, `GitHubClient.commitFiles` / `findOpenPr`, and parts of `eval-ci`, `knowledge`, `productionize`, `trace`.
**Cause:** the two copies are maintained by hand; server changes were not mirrored.
**Fix / status:** open. Compare with `diff -r ../server/src/vendor/shared src/vendor/shared` before relying on a contract.
