# reviewer-core — `@devdigest/reviewer-core`

Pure review engine: diff + system prompt + repo context → prompt → LLM → structured, grounded findings.
Consumed by `server` as **TypeScript source** through a tsconfig path alias. It never emits JS.

## Stack
TypeScript 5 strict · zod 3 · openai SDK 4 (used for OpenRouter) · vitest 2

## Commands (run from `reviewer-core/`, npm, not pnpm)
- Tests: `npm test` · Typecheck (this is also the "build"): `npm run typecheck`
- After a change here, also run `pnpm typecheck` in `../server`, which compiles against this source.

## Where things live
- `src/index.ts`: public API. Anything server uses must be exported here.
- `src/review/run.ts`: `reviewPullRequest` orchestration (single-pass / map-reduce / auto).
- `src/prompt.ts`: `assemblePrompt`, `wrapUntrusted`, `INJECTION_GUARD`.
- `src/grounding.ts`: citation gate. `src/llm/structured.ts`: Zod → JSON Schema, parse-with-repair.

## Conventions (non-default)
- **Stay pure:** no DB, filesystem, GitHub or env access. The only side effect is the injected `LLMProvider`.
- Optional prompt slots (`skills`, `memory`, `specs`, `callers`, `repoMap`) follow an omit-when-empty contract:
  when an input is absent, the prompt section disappears entirely.
- Contracts (`Review`, `Finding`, …) come from `@devdigest/shared`. Do not redefine them locally.
- Tests use a stubbed `LLMProvider`: no keys, no network.

## Gotchas
- `@devdigest/shared` resolves to `../server/src/vendor/shared`, the **server** copy, not the client copy.
- `zod` is pinned to this package's `node_modules` in `tsconfig.json` to avoid two zod instances.

## Do not touch
- **Grounding is mandatory.** Never keep a finding whose lines are not in the diff, and never trust the model's score:
  it is recomputed from surviving findings.
- **Prompt-injection defense is the single `INJECTION_GUARD` rule plus `wrapUntrusted`.** Do not add
  keyword/denylist scanning of untrusted text. It was rejected on purpose.
- `FULL_FILE_KINDS` in `grounding.ts` is reserved for future gates (secret, phantom, hook).

## Documentation (open when relevant)
- Pipeline diagram and public API → `README.md`
- How the server feeds inputs → `../server/README.md` ("Review context")
- Deep dives → `docs/` · Feature specs → `specs/` · Known pitfalls → `insights.md`
