# M1 — FINDINGS column in the PR list

Server side (aggregation basis, contract): `server/specs/m1-findings-column.md`.

## Goal
See a PR's review state from the list without opening it.

## Scope
**In**
| # | Screen | Shows |
|---|---|---|
| 1 | PR list → new `FINDINGS` column between SCORE and STATUS | `▲ 2 ⚠ 2 💡 2`: icon + count per level, zero levels hidden; hover/focus → popover «6 findings» with a preview |

**Out**: clicking a preview row to open the finding; sorting/filtering by findings; hiding
dismissed findings; changes to `SeverityCounters` (PR page) or the COST column.

## Decisions
- Counts = sum over the latest done run of each agent (see the server spec). They match the
  newest done card per agent in Agent runs on the PR page.
- `findings == null` (never reviewed) → «—», as in COST. `total: 0` → muted «0», no popover.
- Popover title number == sum of the cell counts. Rows: severity icon, title, `path:line`,
  confidence %, rationale clamped to 2 lines; «+K more» when the preview is shorter than total.
- Colors/icons from `SEV` via `SeverityBadge compact`; labels in `messages/en/prReview.json`
  (`list.columns.findings`, `list.findings.*`).
- Accessibility: same pattern as the `RunCostBadge` tooltip (focusable, opens on focus, Escape
  closes, `role="tooltip"` + `aria-describedby`). Click inside does not navigate the row.

## Design
- Component `src/app/repos/[repoId]/pulls/_components/FindingsCell/`.
- `pulls/constants.ts`: `GRID` + `COLUMN_KEYS` get the new column.

## Acceptance
- `FindingsCell.test.tsx`: «—», hidden zero levels, popover on focus (title, order, `path:line`,
  «+K more»), Escape closes, severity icons labelled from `messages/` (not the raw enum),
  popover portalled to `<body>` with `position: fixed`.
- Popover/tooltip (FindingsCell and RunCostBadge compact) render through
  `src/components/anchored-popover` so the table card's `overflow: hidden` cannot clip them;
  near the viewport bottom they open upward (`placement.test.ts`).
- `pnpm test` and `pnpm typecheck` green.

## Status
done
