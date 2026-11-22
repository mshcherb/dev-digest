# server — insights

Lessons for anyone working in `server/` (except `src/modules/repo-intel/`, which has its own file).
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

### 2026-11-21 — reviews bypass JobRunner; single-instance assumption
**Where:** `server/src/modules/reviews/service.ts:133` (`ReviewService.runReview → executeRuns`), `server/src/modules/reviews/service.ts:93` (`ReviewService.reapStaleRuns`), `server/src/platform/sse.ts:103` (`runBus`)
**Symptom:** clone/index jobs live in the `jobs` table, review runs do not.
**Cause:** `ReviewService.runReview` fires `executeRuns` without awaiting (fire-and-forget); progress goes over `runBus` (in memory).
**Fix / status:** by design for the starter. A restart loses in-flight runs; `reapStaleRuns` marks them failed on boot. Multiple API replicas are not supported.

### 2026-11-21 — job handlers are registered as a side effect of route registration
**Where:** `server/src/modules/repos/routes.ts:24` (`registerCloneJobHandler`), `server/src/modules/repo-intel/routes.ts:30` (`registerIndexJobHandlers`), `server/src/modules/repos/service.ts:69` (`RepoService.registerCloneJobHandler → jobs.enqueue`), `server/src/platform/jobs.ts:49` (`JobRunner.enqueue`)
**Symptom:** `jobs.enqueue(kind)` throws if the handler for `kind` is not registered; the clone job swallows that error when enqueuing indexing.
**Cause:** `registerCloneJobHandler` / `registerIndexJobHandlers` are called from module `routes.ts`.
**Fix / status:** keep in mind when adding job kinds or disabling modules.

### 2026-11-21 — DB schema and contracts cover all future milestones
**Where:** `server/src/db/schema/ci.ts:14` (`ciRuns`), `server/src/db/schema/eval.ts:7` (`evalCases`), `server/src/db/schema/context.ts:120` (`onboarding`), `server/src/db/schema/reviews.ts:57` (`prBrief`), `server/src/db/schema/ops.ts:41` (`digests`), `server/src/db/schema/ops.ts:29` (`installedPlugins`), `server/src/db/schema/runs.ts:42` (`multiAgentRuns`), `server/src/db/schema/knowledge.ts:31` (`conventions`)
**Symptom:** tables like `ci_runs`, `eval_*`, `onboarding`, `pr_brief`, `digests`, `installed_plugins`, `multi_agent_runs`, `conventions` are never referenced by modules; contracts `brief`, `eval-ci`, `why`, `productionize` are unused; `src/prompts/onboarding.system.md` exists before M5.
**Cause:** the starter ships the full schema so milestones only add modules.
**Fix / status:** expected. Do not delete them as dead code.

### 2026-11-21 — README says LLM calls go "via OpenRouter", code has three providers
**Where:** `server/src/platform/container.ts:165` (`Container.llm`)
**Symptom:** `container.llm()` resolves `openai`, `anthropic` or `openrouter` by the agent's provider.
**Fix / status:** trust the code; the README sentence is a simplification.

### 2026-11-21 — `.gitignore` mentions a missing `agent-runner/`
**Where:** `.gitignore:3` (`agent-runner/dist`)
**Cause:** the CI runner package returns in milestone M6 (Export to CI).
**Fix / status:** expected.

### 2026-11-22 — PR-list SCORE and FINDINGS use different bases
**Where:** `server/src/modules/pulls/routes.ts:121` (`latestReviewByPr`), `server/src/modules/pulls/findings.ts:39` (`pickLatestRunPerAgent`)
**Symptom:** with two agents, the list's SCORE ring reflects one agent while FINDINGS sums both.
**Cause:** SCORE = the single newest `kind='review'` row for the PR; FINDINGS = the latest `status='done'` run of each agent, summed (product decision, `server/specs/m1-findings-column.md`). Runs link to findings only via `reviews.run_id` (no FK).
**Do instead:** do not "unify" one into the other without a spec change; to join run → findings use `reviews.run_id`, never `reviews.agent_id`/`created_at`.

### 2026-11-22 — PR list syncs on GET; `/poll` has no client caller; seed review has no run
**Where:** `server/src/modules/pulls/routes.ts:47` (`listPullRequests`), `server/src/modules/polling/routes.ts:20` (`/repos/:id/poll`), `server/src/db/seed.ts:136` (`insert(t.reviews)`)
**Symptom:** you look for the "import PRs" step and find only `POST /repos/:id/poll`. On a fresh seed, PR #482 shows score 61 but no cost and no findings.
**Cause:** `GET /repos/:id/pulls` upserts from GitHub and backfills stats on every read (the client refetches every 60 s). The seed inserts a `review` with no `agent_runs` row and no `run_id`, and cost and findings are built from runs.
**Do instead:** change PR sync in `pulls/routes.ts`, not `polling/`. Do not treat the seed's null cost/findings as a bug. Details: `server/docs/repo-and-pr-ingestion.md`, `server/docs/pr-list-aggregates.md`.

## Tool & Library Notes
<!-- Dependency and tooling quirks: name the package and version. -->

### 2026-11-21 — `server/package.json` skip-worktree is a per-developer convention
**Where:** `TESTING.md:83` (`server/package.json is skip-worktree`)
**Symptom:** `TESTING.md` says the file is `skip-worktree`, but `git ls-files -v` shows a normal `H` flag locally.
**Cause:** the flag is local git state, not committed.
**Fix / status:** CI calls `pnpm exec vitest run …` directly, so it does not depend on local scripts.

### 2026-11-22 — `platform/model-router.ts` contains a NUL byte, so grep skips it
**Where:** `server/src/platform/model-router.ts:44` (`PromptCache`)
**Symptom:** `grep -n PromptCache platform/model-router.ts` prints nothing; `file` reports `data`.
**Cause:** a literal `'\0'` join separator inside the file makes grep treat it as binary.
**Do instead:** use `grep -a` (or the Grep tool) for this file.

## Recurring Errors & Fixes
<!-- Error message or symptom → cause → exact fix. -->

## Session Notes
<!-- Dated wrap-ups: what changed, what is left. 2–3 lines each. -->

## Open Questions
<!-- Unresolved issues. When one is answered, add a new entry in the right section that cites this title. -->

### 2026-11-21 — `server/docker-compose.yml` exposes Postgres on all interfaces
**Where:** `server/docker-compose.yml:13` (`postgres.ports`), `docker-compose.yml:13` (`postgres.ports`)
**Symptom:** the root `docker-compose.yml` binds `127.0.0.1:5432`, but `server/docker-compose.yml` binds `5432:5432` with the well-known password `devdigest/devdigest`.
**Cause:** the security backport (24a8bc4) hardened only the root compose file.
**Fix / status:** open. Either delete the server copy or bind it to loopback too. Use the root file.

### 2026-11-22 — cancelling a single-pass run mid-LLM-call does not stop it
**Where:** `server/src/modules/reviews/service.ts:85` (`ReviewService.cancelRun`), `server/src/platform/sse.ts:79` (`RunBus.complete`), `server/src/modules/reviews/repository/run.repo.ts:142` (`completeAgentRun`), `reviewer-core/src/review/run.ts:164` (`checkCancelled`)
**Symptom:** (found by reading the code, not reproduced) a run cancelled while its one LLM call is in flight later shows `done`, with a review and findings.
**Cause:** the only checkpoint is before each chunk, and single-pass has one chunk. `cancelRun` calls `runBus.complete`, which clears the cancel flag, and `completeAgentRun` has no `status = 'running'` guard.
**Do instead:** open. Either keep the flag until the runner exits, or guard `completeAgentRun('done')` with `status = 'running'`. Documented in `server/docs/run-events-and-trace.md` (Pitfalls).
