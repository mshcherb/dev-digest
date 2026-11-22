# e2e — insights

Lessons for anyone working in `e2e/`.
Written through the `engineering-insights` skill (`.claude/skills/engineering-insights/SKILL.md`).

- **Append-only:** add a new entry at the end of the right section. Never rewrite or delete existing entries.
- **No duplicates:** grep every `insights.md` and `CLAUDE.md` first. A pitfall that bites twice becomes one line under **Gotchas** in `CLAUDE.md`.
- **Entry:** `### YYYY-MM-DD — title`, then **Where:** (`path:LINE` (`symbol`), or `n/a — <reason>`), **Symptom**, **Cause**, **Do instead**. Older entries use **Fix / status**.
- **Trust:** entries are hints, partly written by an LLM. Verify against the code before relying on one.

## What Works
<!-- Approaches and solutions that proved effective here. -->

## What Doesn't Work
<!-- Dead ends, rejected approaches, antipatterns: what was tried, why it failed, what to do instead. Most valuable section. -->

## Codebase Patterns
<!-- Conventions and architecture decisions that are not obvious from the code. -->

### 2026-11-21 — `specs/` here means test flows, not feature specs
**Where:** `e2e/run.ts:55` (`loadFlows`)
**Symptom:** the repo-wide convention has `<package>/specs/` for feature specs, but `e2e/specs/` holds `*.flow.json` test flows read by `run.ts`.
**Fix / status:** feature specs for e2e live in `docs/specs/`. `run.ts` only picks `*.flow.json`, so other files there would be ignored, but keep the folder flows-only.

### 2026-11-22 — `docs/specs/` removed; supersedes "`specs/` here means test flows, not feature specs"
**Where:** `e2e/CLAUDE.md:39` (`specs/ holds test flows`)
**Symptom:** the earlier entry says feature specs for e2e live in `e2e/docs/specs/`. That folder only ever held a template README.
**Cause:** e2e has no features of its own. A feature's acceptance flow is described in that feature's spec in `client/specs/` or `server/specs/`.
**Do instead:** keep `e2e/specs/` flows-only and do not recreate `docs/specs/`.

### 2026-11-22 — the hermetic stack isolates DB and ports, not secrets
**Where:** `scripts/e2e.sh:40` (`export DATABASE_URL`), `server/src/platform/container.ts:158` (`secrets.get('GITHUB_TOKEN')`)
**Symptom:** with a real `GITHUB_TOKEN` in `~/.devdigest/secrets.json`, flows are slower, and the e2e API logs GitHub errors for `acme/payments-api`.
**Cause:** `SecretsProvider` reads the developer's secrets file. The PR list and detail routes try GitHub, fail, and fall back to the seeded rows.
**Do instead:** expected; flows still pass. Do not "fix" it by stubbing GitHub in the seed.

## Tool & Library Notes
<!-- Dependency and tooling quirks: name the package and version. -->

## Recurring Errors & Fixes
<!-- Error message or symptom → cause → exact fix. -->

### 2026-11-21 — flows 02/04/05 require the seeded demo repo to be the only repo
**Where:** `e2e/specs/02-repo-pulls-detail.flow.json:6` (`wait --url /pulls`), `e2e/specs/04-pr-findings.flow.json:6` (`wait --url /pulls`), `e2e/specs/05-pr-diff.flow.json:6` (`wait --url /pulls`)
**Symptom:** `npm test` against a dev DB with other imported repos fails on the home redirect.
**Fix / status:** run `./scripts/e2e.sh` (isolated stack, alternate ports). Never "reset" with `docker compose down -v`.

## Session Notes
<!-- Dated wrap-ups: what changed, what is left. 2–3 lines each. -->

## Open Questions
<!-- Unresolved issues. When one is answered, add a new entry in the right section that cites this title. -->
