# e2e — insights

Log of pitfalls, surprises and decisions. Newest first. Read before debugging something odd.

Entry format: `## YYYY-MM-DD — title`, then **Symptom**, **Cause**, **Fix / status**.
If a pitfall bites twice, compress it to one line under **Gotchas** in `CLAUDE.md`.

## 2026-11-21 — `specs/` here means test flows, not feature specs
**Symptom:** the repo-wide convention has `<package>/specs/` for feature specs, but `e2e/specs/` holds `*.flow.json` test flows read by `run.ts`.
**Fix / status:** feature specs for e2e live in `docs/specs/`. `run.ts` only picks `*.flow.json`, so other files there would be ignored, but keep the folder flows-only.

## 2026-11-21 — flows 02/04/05 require the seeded demo repo to be the only repo
**Symptom:** `npm test` against a dev DB with other imported repos fails on the home redirect.
**Fix / status:** run `./scripts/e2e.sh` (isolated stack, alternate ports). Never "reset" with `docker compose down -v`.
