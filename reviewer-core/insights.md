# reviewer-core — insights

Log of pitfalls, surprises and decisions. Newest first. Read before debugging something odd.

Entry format: `## YYYY-MM-DD — title`, then **Symptom**, **Cause**, **Fix / status**.
If a pitfall bites twice, compress it to one line under **Gotchas** in `CLAUDE.md`.

## 2026-11-21 — stale reference to `FILE_MAP_THRESHOLD_LINES`
**Symptom:** a comment in `src/review/run.ts` says the default map-reduce threshold matches the server's `FILE_MAP_THRESHOLD_LINES`, but no such constant exists in `server/src`.
**Fix / status:** the threshold lives only here. Update the comment if you touch the file.

## 2026-11-21 — compiles against the **server** copy of shared contracts
**Symptom:** `tsconfig.json` maps `@devdigest/shared` to `../server/src/vendor/shared` and pins `zod` to the local `node_modules`.
**Cause:** no workspace; the zod pin avoids two zod instances (which breaks `instanceof ZodError`).
**Fix / status:** by design. The client copy of contracts is not what this package sees.

## 2026-11-21 — roadmap features already present in the engine
**Symptom:** map-reduce strategy, `reduce()`, `toReview()` (CI payload), and `FULL_FILE_KINDS` (`secret_leak`, `phantom`, `hook`) exist although the README assigns them to M6/M7.
**Fix / status:** expected. Later milestones only start feeding these paths.
