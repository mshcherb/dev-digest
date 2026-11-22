# client — insights

Lessons for anyone working in `client/`.
Written through the `engineering-insights` skill (`.claude/skills/engineering-insights/SKILL.md`).

- **Append-only:** add a new entry at the end of the right section. Never rewrite or delete existing entries.
- **No duplicates:** grep every `insights.md` and `CLAUDE.md` first. A pitfall that bites twice becomes one line under **Gotchas** in `CLAUDE.md`.
- **Entry:** `### YYYY-MM-DD — title`, then **Where:** (`path:LINE` (`symbol`), or `n/a — <reason>`), **Symptom**, **Cause**, **Do instead**. Older entries use **Fix / status**.
- **Trust:** entries are hints, partly written by an LLM. Verify against the code before relying on one.

## What Works
<!-- Approaches and solutions that proved effective here. -->

## What Doesn't Work
<!-- Dead ends, rejected approaches, antipatterns: what was tried, why it failed, what to do instead. Most valuable section. -->

### 2026-11-21 — mixing `border` shorthand with `borderColor` in inline styles
**Where:** `client/src/app/repos/[repoId]/pulls/[number]/_components/FindingCard/styles.ts:7` (`s.card`)
**Symptom:** toggled button keeps a stale border; console warns "Removing borderColor … border … can lead to styling bugs". jsdom tests pass.
**Cause:** React removes the longhand on re-render; the browser falls back to the shorthand's color (`currentColor`).
**Do instead:** never mix `border`/`borderLeft*` shorthands with longhands in inline styles; use `borderWidth`/`borderStyle`/`borderColor` only. Verify toggled styles in a real browser. Known offender: `FindingCard/styles.ts`.

### 2026-11-22 — absolute-positioned popovers inside the PR list get clipped
**Where:** `client/src/app/repos/[repoId]/pulls/styles.ts:86` (`tableCard`), `client/src/components/anchored-popover/AnchoredPopover.tsx:20` (`AnchoredPopover`)
**Symptom:** the FINDINGS popover / COST tooltip is cut off on the last rows and on a one-PR list; jsdom tests pass.
**Cause:** `tableCard` has `overflow: hidden` (for its rounded corners), which clips any `position: absolute` child.
**Do instead:** render row popovers through `AnchoredPopover` (portal to `<body>`, `position: fixed`, flips up, caps height). Keep `onClick={e => e.stopPropagation()}` on it: React events still bubble through the portal to the row link. Check the last row in a real browser.

## Codebase Patterns
<!-- Conventions and architecture decisions that are not obvious from the code. -->

### 2026-11-21 — strings and components for future milestones already exist
**Where:** `client/src/vendor/ui/ExportWizardSteps.tsx:6` (`ExportWizardSteps`), `client/src/vendor/ui/AutoTriggerStatus.tsx:5` (`AutoTriggerStatus`)
**Symptom:** `messages/en` contains `blast`, `brief`, `ci`, `eval`, `memory`, … and `vendor/ui` has `ExportWizardSteps`, `AutoTriggerStatus` with little or no usage.
**Cause:** the design system and i18n were vendored whole from the full product.
**Fix / status:** expected. Reuse them when building milestones instead of re-creating.

### 2026-11-21 — failed runs report 0/0 tokens, not null
**Where:** `server/src/modules/reviews/run-executor.ts:85` (`RunExecutor.executeRuns`), `server/src/modules/reviews/run-executor.ts:311` (`RunExecutor.runOneAgent`), `client/src/components/run-cost-badge/RunCostBadge.tsx:40` (`InlineCost noUsage`)
**Symptom:** a failed or cancelled run's cost badge read "0 tok · —".
**Cause:** `run-executor.ts` failure paths persist `tokensIn: 0, tokensOut: 0` with `costUsd: null`.
**Do instead:** treat `!tokens_in && !tokens_out` as "no usage" (see `src/components/run-cost-badge/RunCostBadge.tsx`); only `cost_usd == null` means unknown cost, never render it as `$0.00`.

### 2026-11-21 — vendored `SeverityBadge` has hard-coded English labels
**Where:** `client/src/vendor/ui/primitives/Badge.tsx:80` (`SeverityBadge`), `client/src/vendor/ui/primitives/tokens.ts:3` (`Severity`)
**Symptom:** `SeverityBadge` renders `SEV.label` (English), which bypasses next-intl.
**Cause:** vendored design system predates i18n here.
**Do instead:** use `compact` (icon + count) and put the label from `messages/` next to it. Use the 3-value `Severity` from `@devdigest/shared`, not `@devdigest/ui`'s (has `INFO`).

### 2026-11-21 — `FindingCard.defaultExpanded` is read only on mount
**Where:** `client/src/app/repos/[repoId]/pulls/[number]/_components/FindingCard/FindingCard.tsx:44` (`FindingCard`), `client/src/app/repos/[repoId]/pulls/[number]/_components/FindingsPanel/FindingsPanel.tsx:80` (`FindingsPanel`)
**Symptom:** after filtering `FindingsPanel`, the first card of the new list stayed collapsed.
**Cause:** `FindingCard` copies `defaultExpanded` into state once; filtered lists reuse already-mounted cards (`key={f.id}`).
**Do instead:** key the list container by the filter state (`key={`${severity ?? "all"}:${hideLow}`}` in `FindingsPanel.tsx`) so cards remount and the first one opens.

## Tool & Library Notes
<!-- Dependency and tooling quirks: name the package and version. -->

## Recurring Errors & Fixes
<!-- Error message or symptom → cause → exact fix. -->

### 2026-11-21 — `Module not found: Can't resolve './contracts/findings.js'` in Next dev
**Where:** `client/src/app/repos/[repoId]/pulls/[number]/_components/FindingsPanel/helpers.ts:16` (`SEVERITY_LEVELS`), `client/src/lib/shared-imports.test.ts:23` (`are type-only outside vendor/`)
**Symptom:** PR page shows a Build Error from `src/vendor/shared/index.ts`; `pnpm test` and `pnpm typecheck` are green.
**Cause:** a **value** import from `@devdigest/shared` (here `Severity.options` in `FindingsPanel/helpers.ts`) bundles the vendored barrel, whose `./contracts/*.js` specifiers Next's webpack cannot map to `.ts`. Vitest and tsc resolve them, so only the browser breaks.
**Do instead:** import `@devdigest/shared` with `import type` only; keep runtime lists as literals (`as const satisfies readonly Severity[]` + a type-level exhaustiveness check). Guarded by `src/lib/shared-imports.test.ts`.

## Session Notes
<!-- Dated wrap-ups: what changed, what is left. 2–3 lines each. -->

## Open Questions
<!-- Unresolved issues. When one is answered, add a new entry in the right section that cites this title. -->

### 2026-11-21 — `vendor/shared` has drifted from the server copy
**Where:** `client/src/vendor/shared/adapters.ts:77` (`LLMProvider.id`), `server/src/vendor/shared/adapters.ts:83` (`LLMProvider.id`)
**Symptom:** `client/src/vendor/shared` lacks `'openrouter'` in `LLMProvider.id`, `sessionId`, `GitClient.sync` / `diffNameOnly`, `GitHubClient.commitFiles` / `findOpenPr`, and parts of `eval-ci`, `knowledge`, `productionize`, `trace`.
**Cause:** the two copies are maintained by hand; server changes were not mirrored.
**Fix / status:** open. Compare with `diff -r ../server/src/vendor/shared src/vendor/shared` before relying on a contract.
