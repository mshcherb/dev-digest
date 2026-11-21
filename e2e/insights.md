# e2e — insights

Lessons for anyone working in `e2e/`.
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

### 2026-11-21 — `specs/` here means test flows, not feature specs
**Symptom:** the repo-wide convention has `<package>/specs/` for feature specs, but `e2e/specs/` holds `*.flow.json` test flows read by `run.ts`.
**Fix / status:** feature specs for e2e live in `docs/specs/`. `run.ts` only picks `*.flow.json`, so other files there would be ignored, but keep the folder flows-only.

## Tool & Library Notes
<!-- Dependency and tooling quirks: name the package and version. -->

## Recurring Errors & Fixes
<!-- Error message or symptom → cause → exact fix. -->

### 2026-11-21 — flows 02/04/05 require the seeded demo repo to be the only repo
**Symptom:** `npm test` against a dev DB with other imported repos fails on the home redirect.
**Fix / status:** run `./scripts/e2e.sh` (isolated stack, alternate ports). Never "reset" with `docker compose down -v`.

## Session Notes
<!-- Dated wrap-ups: what changed, what is left. 2–3 lines each. -->

## Open Questions
<!-- Unresolved issues. When one is answered, add a new entry in the right section that cites this title. -->
