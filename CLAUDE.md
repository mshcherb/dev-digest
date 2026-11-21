# DevDigest

Local-first AI pull-request review. This repo is the **starter**: one end-to-end flow
(add repo → import PR → run agent review). Features return milestone by milestone (M1–M8).

## Packages
No workspace: each package has its own `package.json` + lockfile. Run commands from inside the package.

| Folder | What | Pkg manager | Map |
|---|---|---|---|
| `server/` | Fastify API + Postgres, `repo-intel` indexer | pnpm | `server/CLAUDE.md` |
| `client/` | Next.js studio UI | pnpm | `client/CLAUDE.md` |
| `reviewer-core/` | Pure review engine: diff → prompt → LLM → grounded findings | npm | `reviewer-core/CLAUDE.md` |
| `e2e/` | Deterministic browser e2e (agent-browser) | npm | `e2e/CLAUDE.md` |

## Stack
Node ≥22 · pnpm ≥10 · TypeScript 5.9 strict · zod 3 · vitest 2 · Postgres 16 + pgvector.
Only Postgres runs in Docker; API and web run on the host.

## Commands
- Whole stack from zero: `./scripts/dev.sh` (`--no-seed`, `--no-client`, `--db-only`)
- Isolated e2e stack (own ports, own DB): `./scripts/e2e.sh`
- Tests and builds: per package, see that package's `CLAUDE.md`

## Cross-package gotchas
- Packages link through **tsconfig path aliases to source**, not published modules:
  `server` → `../reviewer-core/src`; `reviewer-core` → `../server/src/vendor/shared`.
- `@devdigest/shared` (Zod contracts) exists as **two copies**: `server/src/vendor/shared` and
  `client/src/vendor/shared`. They have already drifted. Apply a contract change to both copies.
- CI is path-filtered per package. A `reviewer-core` change also triggers `server-unit`.
- Single-user mode with no login: the app needs `pnpm db:seed` (system user + default workspace).
- DB schema already holds tables for every future milestone. Empty tables are expected, not dead code.

## Do not touch
- `docker compose down -v`: it deletes the `devdigest_pgdata` volume with every imported repo and review.
  To get a clean DB for tests, use `./scripts/e2e.sh`. Ask the user before touching the volume.
- `server/clones/**`: runtime checkouts, git-ignored.
- Already-applied migrations in `server/src/db/migrations/`: add a new one instead.
- `.env` files: secrets. Use `.env.example` as the reference.

## Documentation (open only when the task needs it)
- Product, roadmap, quick start, troubleshooting → `README.md`
- Test strategy, suite map, CI workflows → `TESTING.md`
- Writing or tuning agent system prompts → `docs/agent-prompts/`
- Every package has the same set:
  - `README.md`: what the package is and how it is wired (diagrams live here)
  - `docs/`: deep dives on how things work today
  - `specs/<feature>.md`: what we are building. Check it before starting a feature.
  - `insights.md`: log of pitfalls and decisions. Read it before debugging something odd.

## Keeping these files healthy
- Learned something non-obvious? Append an entry to `<package>/insights.md` (date, symptom, cause, fix).
- If a pitfall bites twice, compress it to one line under that package's **Gotchas**.
- Keep every `CLAUDE.md` under 100 lines. Test for each line: "if I removed it, would Claude start making mistakes?"
