# server — docs

Deep dives on how `server` works **today**, one flow per file, with `path:LINE` (`symbol`) links
into the code. The package overview, API map and wiring diagrams stay in [`../README.md`](../README.md);
plans live in [`../specs/`](../specs/).

| Topic | What it covers | Read when… |
|---|---|---|
| [repo-and-pr-ingestion.md](repo-and-pr-ingestion.md) | clone + index jobs, PR list sync on GET, PR detail refresh with offline fallback, comments proxy | you touch repos, pulls or JobRunner, or wonder why a PR is missing or stale |
| [review-execution.md](review-execution.md) | `POST /pulls/:id/review` → runs → `loadDiff` → `reviewPullRequest` → persisted review | you change how a review runs, what context it gets, or what is saved |
| [run-events-and-trace.md](run-events-and-trace.md) | RunLogger → RunBus → SSE, trace document, cancel, delete, boot reaper | you debug the Live Log, a stuck or cancelled run, or the run trace |
| [llm-providers-and-cost.md](llm-providers-and-cost.md) | provider resolution, retry/repair, where `cost_usd` comes from | you add a provider or model, or a cost looks wrong or null |
| [data-model.md](data-model.md) | review-path tables and links, nullable run columns, empty tables per roadmap row | you write a query or migration, or think a table is dead code |
| [pr-list-aggregates.md](pr-list-aggregates.md) | the only place the score / cost / findings / status rules are written | you change the PR list columns or see them disagree |

The indexer has its own README: [`../src/modules/repo-intel/README.md`](../src/modules/repo-intel/README.md).
