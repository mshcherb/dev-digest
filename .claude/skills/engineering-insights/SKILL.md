---
name: engineering-insights
description: Reads and records engineering lessons in the insights.md of the module a task touches. Use at the START of every task in this repo — right after the request is clarified, before reading or changing code — to read that module's lessons; and at the END of every task, before the final answer, to record anything new and important learned (dead ends, fixes found after several attempts, library quirks, recurring errors, conventions, decisions). Also on /engineering-insights. Invoke it even when reading insights.md by hand looks enough — only the skill has the duplicate check and the required `insights:` line of the final answer.
---

1. Module → file: `server/src/modules/repo-intel/**` → its `insights.md`; `server/`, `client/`, `reviewer-core/`, `e2e/` → `<pkg>/insights.md`; root scripts/CI or a cross-package lesson → `./insights.md`. Several modules → each of their files.
2. **Start (mandatory):** once the request is clear and before anything else, read the module's `insights.md`. Entries are hints: verify them against the code. While working, keep a private list of candidate lessons; don't write yet.
3. **End (mandatory check, write only if it matters):** before the final answer, keep only candidates that are new, important, non-obvious and specific. None left → write nothing.
4. **No duplicates:** re-read the target file and `grep -rn -i` 2–3 key terms (function, file, error text) across every `insights.md` and `CLAUDE.md`. Already there → skip it. Same pitfall bit a second time → no new entry; propose one line for that package's CLAUDE.md **Gotchas**.
5. Put each entry in one section: What Works · What Doesn't Work · Codebase Patterns · Tool & Library Notes · Recurring Errors & Fixes · Session Notes · Open Questions. Dead ends → What Doesn't Work. Format: `### YYYY-MM-DD — <title>`, then **Symptom**, **Cause**, **Do instead** (name file, function or version). Add a Session Notes entry (2–3 lines) only for a substantial session.
6. Concrete, not banal: an agent reading it cold must know what to do. "Promises can be tricky" is noise; "`Promise.all()` in ingest times out past 30 items — use `allSettled()` in batches of 10" is a lesson. Obvious from code, README or CLAUDE.md → don't write.
7. Append-only: add at the end of the section; never edit or delete existing entries (a resolved Open Question gets a new entry where the answer belongs, citing its title).
8. Last line of the final answer: `insights: <file> → <section> — <title>` per entry, or `insights: nothing new`.
