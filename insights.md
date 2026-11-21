# dev-digest — cross-package insights

Lessons that span packages or live outside them: `scripts/`, CI workflows, root `docker-compose.yml`, root docs.
A lesson about one package goes to that package's `insights.md` instead.
Written through the `engineering-insights` skill (`.claude/skills/engineering-insights/SKILL.md`).

- **Append-only:** add a new entry at the end of the right section. Never rewrite or delete existing entries.
- **No duplicates:** grep every `insights.md` and `CLAUDE.md` first. A pitfall that bites twice becomes one line in the root `CLAUDE.md` (**Cross-package gotchas**).
- **Entry:** `### YYYY-MM-DD — title`, then **Symptom**, **Cause**, **Do instead**. Older entries use **Fix / status**.
- **Trust:** entries are hints, partly written by an LLM. Verify against the code before relying on one.

## What Works
<!-- Approaches and solutions that proved effective here. -->

## What Doesn't Work
<!-- Dead ends, rejected approaches, antipatterns: what was tried, why it failed, what to do instead. Most valuable section. -->

## Codebase Patterns
<!-- Conventions and architecture decisions that are not obvious from the code. -->

## Tool & Library Notes
<!-- Dependency and tooling quirks: name the package and version. -->

## Recurring Errors & Fixes
<!-- Error message or symptom → cause → exact fix. -->

## Session Notes
<!-- Dated wrap-ups: what changed, what is left. 2–3 lines each. -->

## Open Questions
<!-- Unresolved issues. When one is answered, add a new entry in the right section that cites this title. -->

### 2026-11-21 — README advises `docker compose down -v`, e2e README forbids it
**Symptom:** root README "Reset everything" suggests `down -v`; `e2e/README.md` warns it deletes every imported repo and review.
**Cause:** docs written at different times.
**Fix / status:** open. For a clean DB use `./scripts/e2e.sh`. The root README should be aligned.
