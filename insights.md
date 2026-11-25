# dev-digest — cross-package insights

Lessons that span packages or live outside them: `scripts/`, CI workflows, root `docker-compose.yml`, root docs.
A lesson about one package goes to that package's `insights.md` instead.
Written through the `engineering-insights` skill (`.claude/skills/engineering-insights/SKILL.md`).

- **Append-only:** add a new entry at the end of the right section. Never rewrite or delete existing entries.
- **No duplicates:** grep every `insights.md` and `CLAUDE.md` first. A pitfall that bites twice becomes one line in the root `CLAUDE.md` (**Cross-package gotchas**).
- **Entry:** `### YYYY-MM-DD — title`, then **Where:** (`path:LINE` (`symbol`), or `n/a — <reason>`), **Symptom**, **Cause**, **Do instead**. Older entries use **Fix / status**.
- **Trust:** entries are hints, partly written by an LLM. Verify against the code before relying on one.

## What Works
<!-- Approaches and solutions that proved effective here. -->

### 2026-11-22 — Resolved: clean DB via `./scripts/e2e.sh`, never `docker compose down -v`
**Where:** `README.md:160` (`Need a clean DB`), `e2e/README.md:46` (`Never docker compose down -v`), `CLAUDE.md:36` (`Do not touch`)
**Symptom:** answers the Open Question «README advises `docker compose down -v`, e2e README forbids it».
**Cause:** f4441c1 replaced the root README's "Reset everything" (`docker compose down -v`) with a "Need a clean DB" note pointing to `./scripts/e2e.sh`; all docs now agree.
**Do instead:** for a clean DB run `./scripts/e2e.sh` (isolated stack, own ports, own DB). `down -v` deletes the `devdigest_pgdata` volume with every imported repo and review; ask the user before touching it.

## What Doesn't Work
<!-- Dead ends, rejected approaches, antipatterns: what was tried, why it failed, what to do instead. Most valuable section. -->

## Codebase Patterns
<!-- Conventions and architecture decisions that are not obvious from the code. -->

## Tool & Library Notes
<!-- Dependency and tooling quirks: name the package and version. -->

### 2026-11-21 — `pnpm` / `node` missing in non-interactive shells
**Where:** n/a — shell environment (nvm loads only in interactive shells), not repo code
**Symptom:** `pnpm: command not found` when an agent runs `pnpm db:generate` / `pnpm test`.
**Cause:** Node 22 comes from nvm, which only loads in interactive shells.
**Do instead:** prefix commands with `export PATH=~/.nvm/versions/node/v22.23.5/bin:$PATH` (check `ls ~/.nvm/versions/node` for the current version).

### 2026-11-21 — Claude Code shell check blocks `cd`/`cat` into `[repoId]` route folders
**Where:** n/a — Claude Code harness behavior; the affected paths are the `client/src/app/repos/[repoId]/` folders, no specific line
**Symptom:** Bash calls touching `client/src/app/repos/[repoId]/...` are refused ("cd whose target cannot be resolved", or "could not be checked for dangerous rm") even with no `rm`.
**Cause:** the bracketed Next.js dynamic-segment paths confuse the harness's command parser.
**Do instead:** use Read/Edit/Write with absolute paths, or a script in the scratchpad that takes the client root as an argument.

## Recurring Errors & Fixes
<!-- Error message or symptom → cause → exact fix. -->

## Session Notes
<!-- Dated wrap-ups: what changed, what is left. 2–3 lines each. -->

## Open Questions
<!-- Unresolved issues. When one is answered, add a new entry in the right section that cites this title. -->

### 2026-11-21 — README advises `docker compose down -v`, e2e README forbids it
**Where:** `README.md:160` (`Need a clean DB`, formerly "Reset everything"), `e2e/README.md:46` (`Never docker compose down -v`)
**Symptom:** root README "Reset everything" suggests `down -v`; `e2e/README.md` warns it deletes every imported repo and review.
**Cause:** docs written at different times.
**Fix / status:** open. For a clean DB use `./scripts/e2e.sh`. The root README should be aligned.
