# e2e — `@devdigest/e2e`

Deterministic browser flows for the web app, driven by the agent-browser CLI (CDP). No Playwright, no LLM, no API key.

## Stack
agent-browser CLI (global install) · TypeScript runner `run.ts` executed with tsx · npm

## Commands
- One-time setup: `npm i -g agent-browser && agent-browser install`
- **Preferred:** `./scripts/e2e.sh` from the repo root. It starts an isolated, freshly seeded stack
  (Postgres :5433, API :3101, web :3100), runs the flows and tears everything down.
- Against an already running stack: `cd e2e && npm install && npm test` (`E2E_BASE_URL`, default `http://localhost:3000`)
- Typecheck: `npm run typecheck`

## Where things live
- `specs/NN-name.flow.json`: one flow = ordered list of agent-browser commands.
- `run.ts`: runs every flow in one shared browser session. `lib/assert.ts`: stdout assertions.

## Conventions (non-default)
- Each step is `{ "cmd": [...], "label": "..." }`. `{BASE}` is substituted with the base URL.
- Assertions are `wait --text` / `wait --url` (non-zero exit = failure), plus optional `assert.stdoutIncludes`.
- Locators are deterministic only: `--url`, `--text`, `find role|text|label`.
- Flows use **read-only seeded data**: repo `acme/payments-api`, PR `#482`, the two built-in agents.
- New flow = next `NN-` number. Keep it independent of model output.

## Gotchas
- Flows 02/04/05 assume the seeded demo repo is the **only** repo. On a dev DB with other imported repos they fail.
  That is why `./scripts/e2e.sh` exists.
- CI (`e2e-web.yml`) brings up its own stack and calls `npm test` directly. It does not use `scripts/e2e.sh`.

## Do not touch
- Never use the agent-browser AI `chat` command: it makes runs non-deterministic and needs a key.
- Never run `docker compose down -v` to "reset" for e2e: it wipes the developer's real dev data.

## Documentation (open when relevant)
- Flow format and run modes → `README.md`
- Suite map and CI → `../TESTING.md`
- Deep dives → `docs/` · Known pitfalls → `insights.md`
- Here `specs/` holds **test flows**, not feature specs. Feature specs for e2e live in `docs/specs/`.
