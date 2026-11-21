# client — insights

Log of pitfalls, surprises and decisions. Newest first. Read before debugging something odd.

Entry format: `## YYYY-MM-DD — title`, then **Symptom**, **Cause**, **Fix / status**.
If a pitfall bites twice, compress it to one line under **Gotchas** in `CLAUDE.md`.

## 2026-11-21 — `vendor/shared` has drifted from the server copy
**Symptom:** `client/src/vendor/shared` lacks `'openrouter'` in `LLMProvider.id`, `sessionId`, `GitClient.sync` / `diffNameOnly`, `GitHubClient.commitFiles` / `findOpenPr`, and parts of `eval-ci`, `knowledge`, `productionize`, `trace`.
**Cause:** the two copies are maintained by hand; server changes were not mirrored.
**Fix / status:** open. Compare with `diff -r ../server/src/vendor/shared src/vendor/shared` before relying on a contract.

## 2026-11-21 — strings and components for future milestones already exist
**Symptom:** `messages/en` contains `blast`, `brief`, `ci`, `eval`, `memory`, … and `vendor/ui` has `ExportWizardSteps`, `AutoTriggerStatus` with little or no usage.
**Cause:** the design system and i18n were vendored whole from the full product.
**Fix / status:** expected. Reuse them when building milestones instead of re-creating.
