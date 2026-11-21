# repo-intel — insights

Lessons for anyone working in `server/src/modules/repo-intel/` (the indexer). Other server lessons go to `server/insights.md`.
Written through the `engineering-insights` skill (`.claude/skills/engineering-insights/SKILL.md`).

- **Append-only:** add a new entry at the end of the right section. Never rewrite or delete existing entries.
- **No duplicates:** grep every `insights.md` and `CLAUDE.md` first. A pitfall that bites twice becomes one line under **Gotchas** in `server/CLAUDE.md`.
- **Entry:** `### YYYY-MM-DD — title`, then **Symptom**, **Cause**, **Do instead**.
- **Trust:** entries are hints, partly written by an LLM. Verify against the code before relying on one.

## What Works
<!-- Approaches and solutions that proved effective here. -->

## What Doesn't Work
<!-- Dead ends, rejected approaches, antipatterns: what was tried, why it failed, what to do instead. Most valuable section. -->

## Codebase Patterns
<!-- Conventions and architecture decisions that are not obvious from the code. -->

### 2026-11-21 — `vendor/` is excluded by directory name at any depth, so `src/vendor/shared` is never indexed
**Symptom:** indexing dev-digest itself yields no symbols from `server/src/vendor/shared` (or `client/src/vendor/shared`); callers/rank for `@devdigest/shared` contracts look empty.
**Cause:** `EXCLUDED_DIRS` in `constants.ts` contains `'vendor'`; `walkDir` in `pipeline/walk.ts` matches the bare directory name (`EXCLUDED_SET.has(name)`) at every depth, not only the repo root. Both full and incremental (`walkClone`) use it.
**Do instead:** if vendored code should be indexed, change the match to a root-relative path rule (and bump `INDEXER_VERSION`); otherwise accept it. Do not look for the cause in the parser or `.gitignore`.

## Tool & Library Notes
<!-- Dependency and tooling quirks (ast-grep, dependency-cruiser, graphology, ripgrep): name the package and version. -->

## Recurring Errors & Fixes
<!-- Error message or symptom → cause → exact fix. -->

## Session Notes
<!-- Dated wrap-ups: what changed, what is left. 2–3 lines each. -->

## Open Questions
<!-- Unresolved issues. When one is answered, add a new entry in the right section that cites this title. -->
