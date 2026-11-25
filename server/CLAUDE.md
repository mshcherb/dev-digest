# server — `@devdigest/api`

Fastify API on `:3001`: imports repos and PRs, indexes repos (`repo-intel`), stores agents, runs reviews.

## Stack
Fastify 5 · fastify-type-provider-zod 4 · Drizzle ORM 0.45 + postgres.js · p-queue 8 · fastify-sse-v2 ·
@ast-grep/napi · dependency-cruiser · graphology · vitest 2 + testcontainers

## Commands (run from `server/`)
- Dev: `pnpm dev` · Typecheck: `pnpm typecheck` · Build: `pnpm build`
- DB: `pnpm db:migrate` · `pnpm db:seed` (idempotent) · new migration after schema edit: `pnpm db:generate`
- Unit tests, no Docker: `pnpm exec vitest run --exclude '**/*.it.test.ts'`
- Integration tests, needs Docker: `pnpm exec vitest run .it.test`

## Where things live
- `src/modules/<name>/`: `routes.ts` → `service.ts` → `repository.ts`. Registered by hand in `src/modules/index.ts`.
- `src/platform/container.ts`: DI composition root. Adapters and shared repositories are resolved here.
- `src/platform/`: cross-cutting code: config, errors, JobRunner, SSE run bus, run logger, price book.
- `src/adapters/`: outside world (llm, github, git, ast-grep, ripgrep, tokenizer, secrets). Test doubles: `adapters/mocks.ts`.
- `src/db/schema/`: Drizzle tables, one file per domain. `src/db/migrations/`: generated SQL.
- `src/vendor/shared/`: Zod contracts (`@devdigest/shared`). `reviewer-core` compiles against this copy.

## Conventions (non-default)
- Validate routes with zod `schema: { params, body }` via `withTypeProvider<ZodTypeProvider>()`. Do not call `.parse(req.body)` by hand.
- Throw `AppError` / `NotFoundError` / `ConfigError`. The global handler in `app.ts` builds the `{ error: { code, message } }` envelope.
- Cross-module access goes through `container.*` (e.g. `container.repoIntel`, `container.agentsRepo`), never by importing another module's internals.
- Every query is scoped by `workspaceId` from `getContext(container, req)`.
- Unit tests stay hermetic: inject doubles through `buildApp({ overrides })`, with no real keys or network.
- A test that imports `test/helpers/pg.ts` MUST be named `*.it.test.ts`, otherwise the CI split breaks.
- New feature module = new `modules/<name>/routes.ts` + one line in `modules/index.ts`. Do not edit other modules for it.

## Gotchas
- Migrations do NOT run on boot. A `relation does not exist` error means `pnpm db:migrate` was not run.
- Reviews run fire-and-forget from `ReviewService.runReview` (not through JobRunner). Clone and index jobs DO go through JobRunner.
- Job handlers are registered when module routes register. `enqueue` for an unregistered kind throws.
- One API instance per DB is assumed: `running` runs are reaped as stale on boot.
- Secrets come only from `SecretsProvider` (`~/.devdigest/secrets.json`, then `process.env`). They are never in the DB or `AppConfig`.
- After saving a key, call `container.invalidateSecretCaches()`. Providers are cached.
- Never clone from a URL taken from a payload: rebuild it from a validated `owner/name`.
- ZodError is detected by shape as well as `instanceof`, because the shared and api copies of zod can differ.

## Do not touch
- Applied migrations and `src/db/migrations/meta/`: generate a new migration instead.
- `src/vendor/shared/` without mirroring the change into `client/src/vendor/shared/`.
- Host/Origin guard in `app.ts` and `platform/local-only.ts`: it protects an unauthenticated API from DNS rebinding.

## Documentation (open when relevant)
- API map, request/DI flow, env vars, review-context notes → `README.md`
- Indexer pipeline and `repoIntel.*` facade → `src/modules/repo-intel/README.md` · its pitfalls → `src/modules/repo-intel/insights.md`
- Test conventions → `../TESTING.md`
- Deep dives → `docs/` · Feature specs → `specs/` · Known pitfalls → `insights.md`
