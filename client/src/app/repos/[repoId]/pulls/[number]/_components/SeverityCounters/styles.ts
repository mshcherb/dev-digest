import type { CSSProperties } from "react";

/** Co-located styles for SeverityCounters. */
export const s = {
  group: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  } satisfies CSSProperties,
  separator: { color: "var(--text-muted)", fontSize: 12 } satisfies CSSProperties,
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 8px 3px 3px",
    borderRadius: 7,
    // Longhands only: the active state swaps borderColor, and mixing it with the
    // `border` shorthand makes React leave a stale color on re-render.
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    background: "transparent",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.04em",
    color: "var(--text-secondary)",
    transition: "opacity .12s, border-color .12s",
  } satisfies CSSProperties,
} as const;
