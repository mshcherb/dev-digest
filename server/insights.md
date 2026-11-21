# server — insights

Log of pitfalls, surprises and decisions. Newest first. Read before debugging something odd.

Entry format: `## YYYY-MM-DD — title`, then **Symptom**, **Cause**, **Fix / status**.
If a pitfall bites twice, compress it to one line under **Gotchas** in `CLAUDE.md`.

## 2026-11-21 — `server/docker-compose.yml` exposes Postgres on all interfaces
**Symptom:** the root `docker-compose.yml` binds `127.0.0.1:5432`, but `server/docker-compose.yml` binds `5432:5432` with the well-known password `devdigest/devdigest`.
**Cause:** the security backport (24a8bc4) hardened only the root compose file.
**Fix / status:** open. Either delete the server copy or bind it to loopback too. Use the root file.

## 2026-11-21 — README advises `docker compose down -v`, e2e README forbids it
**Symptom:** root README "Reset everything" suggests `down -v`; `e2e/README.md` warns it deletes every imported repo and review.
**Cause:** docs written at different times.
**Fix / status:** open. For a clean DB use `./scripts/e2e.sh`. The root README should be aligned.

## 2026-11-21 — reviews bypass JobRunner; single-instance assumption
**Symptom:** clone/index jobs live in the `jobs` table, review runs do not.
**Cause:** `ReviewService.runReview` fires `executeRuns` without awaiting (fire-and-forget); progress goes over `runBus` (in memory).
**Fix / status:** by design for the starter. A restart loses in-flight runs; `reapStaleRuns` marks them failed on boot. Multiple API replicas are not supported.

## 2026-11-21 — job handlers are registered as a side effect of route registration
**Symptom:** `jobs.enqueue(kind)` throws if the handler for `kind` is not registered; the clone job swallows that error when enqueuing indexing.
**Cause:** `registerCloneJobHandler` / `registerIndexJobHandlers` are called from module `routes.ts`.
**Fix / status:** keep in mind when adding job kinds or disabling modules.

## 2026-11-21 — DB schema and contracts cover all future milestones
**Symptom:** tables like `ci_runs`, `eval_*`, `onboarding`, `pr_brief`, `digests`, `installed_plugins`, `multi_agent_runs`, `conventions` are never referenced by modules; contracts `brief`, `eval-ci`, `why`, `productionize` are unused; `src/prompts/onboarding.system.md` exists before M5.
**Cause:** the starter ships the full schema so milestones only add modules.
**Fix / status:** expected. Do not delete them as dead code.

## 2026-11-21 — `server/package.json` skip-worktree is a per-developer convention
**Symptom:** `TESTING.md` says the file is `skip-worktree`, but `git ls-files -v` shows a normal `H` flag locally.
**Cause:** the flag is local git state, not committed.
**Fix / status:** CI calls `pnpm exec vitest run …` directly, so it does not depend on local scripts.

## 2026-11-21 — README says LLM calls go "via OpenRouter", code has three providers
**Symptom:** `container.llm()` resolves `openai`, `anthropic` or `openrouter` by the agent's provider.
**Fix / status:** trust the code; the README sentence is a simplification.

## 2026-11-21 — `.gitignore` mentions a missing `agent-runner/`
**Cause:** the CI runner package returns in milestone M6 (Export to CI).
**Fix / status:** expected.
