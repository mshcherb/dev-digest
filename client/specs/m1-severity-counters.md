# M1 — Severity counters in a review run

## Goal
An expanded review run shows how many findings of each severity it has, «N CRITICAL · N WARNING ·
N SUGGESTION», right above its finding cards. Clicking a level filters that run's list to the level;
clicking it again clears the filter. Zero extra requests: everything is derived from already-loaded findings.

## Scope
**In**
| # | Screen | Shows |
|---|---|---|
| 1 | PR detail → Agent runs → Review runs → expanded run → `FindingsPanel` toolbar, left side | three buttons `▲ 3 CRITICAL` · `⚠ 1 WARNING` · `💡 0 SUGGESTION`; click = filter by that level |

**Out**: blockers counter in the `ReviewRunAccordion` header; `FindingCard`; Timeline icons; PR list page
(Findings column from the list mockup is a separate task); server; contracts; persisting the filter.

## Decisions
- Data path: `usePrReviews` → `ReviewRecord.findings` → `FindingsPanel`. Counts are a `useMemo` from the
  `findings` prop, so accept/dismiss (which invalidates `["reviews", prId]`) updates them without a reload.
- **Count basis** = list after «Hide low confidence», before the severity filter. Accepted/dismissed
  findings stay counted because the list keeps showing them. A level's number == cards shown after clicking it.
- Filter = `visibleFindings(findings, hideLow)` → `filterBySeverity(…, severity)`: both conditions apply.
- Levels: the `Severity` enum from `@devdigest/shared` (CRITICAL, WARNING, SUGGESTION). UI-only `INFO` is ignored.
- Visual: each level is a `<button aria-pressed>` with `SeverityBadge compact count={n}` (icon + number in
  `SEV` colors) and the label from `messages/en/prReview.json` (`panel.severity.*`). No own palette.
- Active level: border and label in `SEV[sev].c`; the two others dimmed (`opacity: 0.5`). Not hover-based.
  Only one level is active; clicking another moves it; clicking the active one clears filter + highlight.
- A level with no findings shows `0` and stays clickable. Empty result → the existing `FindingsPanel` empty state.
- j/k/a/d keys act on the filtered list; focus resets to the first card on a filter change and is clamped
  when the list shrinks.
- The filter is local state of the panel: it resets when the run is collapsed (panel unmounts). Background
  polling does not reset it.

## Acceptance
- P1: counters for 3 levels are visible in an expanded run; numbers match the list; click filters; filter can be cleared.
- P2: no new requests / routes / tables / model calls; works together with «Hide low confidence»; colors from
  `SEV` / `SeverityBadge`; tests next to `FindingsPanel.test.tsx`; `pnpm test` and `pnpm typecheck` green.
- P3: active level highlighted in its SEV color, the others dimmed, not hover-dependent; 0 levels render; empty
  state on empty result; labels in `prReview.json`; counts match the list after accept/dismiss without reload.

## Dropped from the plan
- Server-side per-severity counts / a new endpoint / an aggregate in `ReviewRecord`: everything is derived
  from already-loaded findings.
- Persisting the filter in the URL or localStorage: not requested; the filter is local to the run.
- A third `severity` parameter on `visibleFindings`: it would be dead code next to the explicit filter
  (critic's note); replaced by a separate `filterBySeverity`.
- A custom chip in `SEV` colors instead of `SeverityBadge`: replaced by `SeverityBadge compact count` + an i18n label.

## Status
implemented, not committed (tests + typecheck green; checked live on acme/payments-api #482)
