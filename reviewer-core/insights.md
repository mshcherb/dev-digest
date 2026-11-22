# reviewer-core — insights

Lessons for anyone working in `reviewer-core/`.
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

### 2026-11-21 — stale reference to `FILE_MAP_THRESHOLD_LINES`
**Where:** `reviewer-core/src/review/run.ts:29` (`DEFAULT_MAP_THRESHOLD_LINES`)
**Symptom:** a comment in `src/review/run.ts` says the default map-reduce threshold matches the server's `FILE_MAP_THRESHOLD_LINES`, but no such constant exists in `server/src`.
**Fix / status:** the threshold lives only here. Update the comment if you touch the file.

### 2026-11-21 — roadmap features already present in the engine
**Where:** `reviewer-core/src/review/run.ts:115` (`selectMode`), `reviewer-core/src/review/reduce.ts:43` (`reduceReviews`), `reviewer-core/src/output/to-review.ts:148` (`toReviewPayload`), `reviewer-core/src/grounding.ts:16` (`FULL_FILE_KINDS`)
**Symptom:** map-reduce strategy, `reduce()`, `toReview()` (CI payload), and `FULL_FILE_KINDS` (`secret_leak`, `phantom`, `hook`) exist although the README assigns them to M6/M7.
**Fix / status:** expected. Later milestones only start feeding these paths.

## Tool & Library Notes
<!-- Dependency and tooling quirks: name the package and version. -->

### 2026-11-21 — compiles against the **server** copy of shared contracts
**Where:** `reviewer-core/tsconfig.json:22` (`paths["@devdigest/shared"]`), `reviewer-core/tsconfig.json:24` (`paths.zod`)
**Symptom:** `tsconfig.json` maps `@devdigest/shared` to `../server/src/vendor/shared` and pins `zod` to the local `node_modules`.
**Cause:** no workspace; the zod pin avoids two zod instances (which breaks `instanceof ZodError`).
**Fix / status:** by design. The client copy of contracts is not what this package sees.

## Recurring Errors & Fixes
<!-- Error message or symptom → cause → exact fix. -->

## Session Notes
<!-- Dated wrap-ups: what changed, what is left. 2–3 lines each. -->

## Open Questions
<!-- Unresolved issues. When one is answered, add a new entry in the right section that cites this title. -->
